/**
 * PilotScript v2 — 独自言語インタプリタ
 *
 * 設計方針:
 * - 命令型・字句解析 → 再帰下降パーサ → AST 評価
 * - 値: null | boolean | number | string | array | function
 * - ブロックスコープ、関数スコープ（クロージャ可）
 * - エラーは行番号付き RuntimeError
 *
 * 文法概要:
 *   program     := stmt*
 *   stmt        := let | assign | if | while | for | fn | return | print | exprStmt | block | builtinCmd
 *   let         := "let" IDENT "=" expr
 *   assign      := IDENT "=" expr
 *   if          := "if" expr block ("else" (if | block))?
 *   while       := "while" expr block
 *   for         := "for" IDENT "in" expr block
 *   fn          := "fn" IDENT "(" params? ")" block
 *   block       := "{" stmt* "}"
 *   expr        := or (||) and (&&) cmp (+- ...) ...
 */

export class RuntimeError extends Error {
  constructor(message, line = 0) {
    super(line ? `line ${line}: ${message}` : message)
    this.line = line
    this.name = 'RuntimeError'
  }
}

// ─── Lexer ───────────────────────────────────────────────

const KEYWORDS = new Set([
  'let', 'if', 'else', 'while', 'for', 'in', 'fn', 'return',
  'true', 'false', 'null', 'print', 'and', 'or', 'not',
])

function tokenize(source) {
  const tokens = []
  let i = 0
  let line = 1
  const n = source.length

  const peek = (k = 0) => source[i + k] || ''
  const adv = () => {
    const c = source[i++]
    if (c === '\n') line++
    return c
  }

  while (i < n) {
    const c = peek()
    if (c === ' ' || c === '\t' || c === '\r') {
      adv()
      continue
    }
    if (c === '\n') {
      adv()
      continue
    }
    // # line comment
    if (c === '#') {
      while (i < n && peek() !== '\n') adv()
      continue
    }
    // // comment
    if (c === '/' && peek(1) === '/') {
      adv()
      adv()
      while (i < n && peek() !== '\n') adv()
      continue
    }
    // string
    if (c === '"' || c === "'") {
      const quote = adv()
      let s = ''
      const startLine = line
      while (i < n && peek() !== quote) {
        if (peek() === '\\') {
          adv()
          const e = adv()
          if (e === 'n') s += '\n'
          else if (e === 't') s += '\t'
          else if (e === '\\') s += '\\'
          else if (e === quote) s += quote
          else s += e
        } else if (peek() === '\n') {
          throw new RuntimeError('unterminated string', startLine)
        } else {
          s += adv()
        }
      }
      if (peek() !== quote) throw new RuntimeError('unterminated string', startLine)
      adv()
      tokens.push({ type: 'string', value: s, line: startLine })
      continue
    }
    // number
    if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(peek(1)))) {
      let num = ''
      const startLine = line
      while (/[0-9]/.test(peek())) num += adv()
      if (peek() === '.') {
        num += adv()
        while (/[0-9]/.test(peek())) num += adv()
      }
      tokens.push({ type: 'number', value: Number(num), line: startLine })
      continue
    }
    // ident / keyword
    if (/[A-Za-z_]/.test(c)) {
      let id = ''
      const startLine = line
      while (/[A-Za-z0-9_]/.test(peek())) id += adv()
      if (KEYWORDS.has(id)) {
        if (id === 'true' || id === 'false') {
          tokens.push({ type: 'bool', value: id === 'true', line: startLine })
        } else if (id === 'null') {
          tokens.push({ type: 'null', value: null, line: startLine })
        } else {
          tokens.push({ type: id, line: startLine })
        }
      } else {
        tokens.push({ type: 'ident', value: id, line: startLine })
      }
      continue
    }
    // two-char ops
    const two = c + peek(1)
    const TWO = {
      '==': 'eq',
      '!=': 'neq',
      '<=': 'lte',
      '>=': 'gte',
      '&&': 'and',
      '||': 'or',
      '..': 'range',
      '+=': 'plusEq',
      '-=': 'minusEq',
      '*=': 'starEq',
      '/=': 'slashEq',
    }
    if (TWO[two]) {
      const startLine = line
      adv()
      adv()
      tokens.push({ type: TWO[two], line: startLine })
      continue
    }
    // single
    const SINGLE = {
      '+': 'plus',
      '-': 'minus',
      '*': 'star',
      '/': 'slash',
      '%': 'percent',
      '(': 'lparen',
      ')': 'rparen',
      '{': 'lbrace',
      '}': 'rbrace',
      '[': 'lbracket',
      ']': 'rbracket',
      ',': 'comma',
      '=': 'assign',
      '<': 'lt',
      '>': 'gt',
      '!': 'not',
      ';': 'semi',
      ':': 'colon',
    }
    if (SINGLE[c]) {
      const startLine = line
      adv()
      tokens.push({ type: SINGLE[c], line: startLine })
      continue
    }
    throw new RuntimeError(`unexpected character '${c}'`, line)
  }
  tokens.push({ type: 'eof', line })
  return tokens
}

// ─── Parser ──────────────────────────────────────────────

function parse(tokens) {
  let p = 0
  const peek = () => tokens[p] || { type: 'eof', line: 0 }
  const at = (t) => peek().type === t
  const consume = (t, msg) => {
    if (!at(t)) throw new RuntimeError(msg || `expected ${t}, got ${peek().type}`, peek().line)
    return tokens[p++]
  }
  const match = (...ts) => {
    for (const t of ts) {
      if (at(t)) {
        p++
        return tokens[p - 1]
      }
    }
    return null
  }

  function parseProgram() {
    const body = []
    while (!at('eof')) body.push(parseStmt())
    return { type: 'Program', body }
  }

  function parseStmt() {
    if (at('let')) return parseLet()
    if (at('if')) return parseIf()
    if (at('while')) return parseWhile()
    if (at('for')) return parseFor()
    if (at('fn')) return parseFn()
    if (at('return')) return parseReturn()
    if (at('print')) return parsePrint()
    if (at('lbrace')) return parseBlock()
    // assignment or expression statement
    const expr = parseExpr()
    if (match('assign')) {
      if (expr.type !== 'Ident' && expr.type !== 'Index') {
        throw new RuntimeError('invalid assignment target', peek().line)
      }
      const value = parseExpr()
      match('semi')
      return { type: 'Assign', target: expr, value, line: expr.line }
    }
    // compound assign
    for (const [op, name] of [
      ['plusEq', '+'],
      ['minusEq', '-'],
      ['starEq', '*'],
      ['slashEq', '/'],
    ]) {
      if (match(op)) {
        if (expr.type !== 'Ident') throw new RuntimeError('invalid assignment target', peek().line)
        const value = parseExpr()
        match('semi')
        return {
          type: 'Assign',
          target: expr,
          value: {
            type: 'Binary',
            op: name,
            left: expr,
            right: value,
            line: expr.line,
          },
          line: expr.line,
        }
      }
    }
    match('semi')
    return { type: 'ExprStmt', expr, line: expr.line }
  }

  function parseLet() {
    const tok = consume('let')
    const name = consume('ident', 'expected variable name').value
    consume('assign', "expected '=' after name")
    const value = parseExpr()
    match('semi')
    return { type: 'Let', name, value, line: tok.line }
  }

  function parseIf() {
    const tok = consume('if')
    const cond = parseExpr()
    const then = parseBlock()
    let els = null
    if (match('else')) {
      els = at('if') ? parseIf() : parseBlock()
    }
    return { type: 'If', cond, then, else: els, line: tok.line }
  }

  function parseWhile() {
    const tok = consume('while')
    const cond = parseExpr()
    const body = parseBlock()
    return { type: 'While', cond, body, line: tok.line }
  }

  function parseFor() {
    const tok = consume('for')
    const name = consume('ident', 'expected iterator name').value
    consume('in', "expected 'in'")
    const iter = parseExpr()
    const body = parseBlock()
    return { type: 'For', name, iter, body, line: tok.line }
  }

  function parseFn() {
    const tok = consume('fn')
    const name = consume('ident', 'expected function name').value
    consume('lparen')
    const params = []
    if (!at('rparen')) {
      params.push(consume('ident').value)
      while (match('comma')) params.push(consume('ident').value)
    }
    consume('rparen')
    const body = parseBlock()
    return { type: 'Fn', name, params, body, line: tok.line }
  }

  function parseReturn() {
    const tok = consume('return')
    let value = null
    if (!at('rbrace') && !at('eof') && !at('semi')) {
      value = parseExpr()
    }
    match('semi')
    return { type: 'Return', value, line: tok.line }
  }

  function parsePrint() {
    const tok = consume('print')
    const args = []
    if (!at('rbrace') && !at('eof') && !at('semi') && !at('let') && !at('if') && !at('while') && !at('for') && !at('fn') && !at('return') && !at('print')) {
      args.push(parseExpr())
      while (match('comma')) args.push(parseExpr())
    }
    match('semi')
    return { type: 'Print', args, line: tok.line }
  }

  function parseBlock() {
    const tok = consume('lbrace')
    const body = []
    while (!at('rbrace') && !at('eof')) body.push(parseStmt())
    consume('rbrace', "expected '}'")
    return { type: 'Block', body, line: tok.line }
  }

  function parseExpr() {
    return parseOr()
  }

  function parseOr() {
    let left = parseAnd()
    while (match('or')) {
      const right = parseAnd()
      left = { type: 'Binary', op: '||', left, right, line: left.line }
    }
    return left
  }

  function parseAnd() {
    let left = parseEquality()
    while (match('and')) {
      const right = parseEquality()
      left = { type: 'Binary', op: '&&', left, right, line: left.line }
    }
    return left
  }

  function parseEquality() {
    let left = parseComparison()
    while (true) {
      if (match('eq')) left = { type: 'Binary', op: '==', left, right: parseComparison(), line: left.line }
      else if (match('neq')) left = { type: 'Binary', op: '!=', left, right: parseComparison(), line: left.line }
      else break
    }
    return left
  }

  function parseComparison() {
    let left = parseRange()
    while (true) {
      if (match('lt')) left = { type: 'Binary', op: '<', left, right: parseRange(), line: left.line }
      else if (match('gt')) left = { type: 'Binary', op: '>', left, right: parseRange(), line: left.line }
      else if (match('lte')) left = { type: 'Binary', op: '<=', left, right: parseRange(), line: left.line }
      else if (match('gte')) left = { type: 'Binary', op: '>=', left, right: parseRange(), line: left.line }
      else break
    }
    return left
  }

  function parseRange() {
    let left = parseTerm()
    if (match('range')) {
      const right = parseTerm()
      return { type: 'Range', start: left, end: right, line: left.line }
    }
    return left
  }

  function parseTerm() {
    let left = parseFactor()
    while (true) {
      if (match('plus')) left = { type: 'Binary', op: '+', left, right: parseFactor(), line: left.line }
      else if (match('minus')) left = { type: 'Binary', op: '-', left, right: parseFactor(), line: left.line }
      else break
    }
    return left
  }

  function parseFactor() {
    let left = parseUnary()
    while (true) {
      if (match('star')) left = { type: 'Binary', op: '*', left, right: parseUnary(), line: left.line }
      else if (match('slash')) left = { type: 'Binary', op: '/', left, right: parseUnary(), line: left.line }
      else if (match('percent')) left = { type: 'Binary', op: '%', left, right: parseUnary(), line: left.line }
      else break
    }
    return left
  }

  function parseUnary() {
    if (match('minus')) {
      const arg = parseUnary()
      return { type: 'Unary', op: '-', arg, line: arg.line }
    }
    if (match('not')) {
      const arg = parseUnary()
      return { type: 'Unary', op: '!', arg, line: arg.line }
    }
    return parseCall()
  }

  function parseCall() {
    let expr = parsePrimary()
    while (true) {
      if (match('lparen')) {
        const args = []
        if (!at('rparen')) {
          args.push(parseExpr())
          while (match('comma')) args.push(parseExpr())
        }
        consume('rparen')
        expr = { type: 'Call', callee: expr, args, line: expr.line }
      } else if (match('lbracket')) {
        const index = parseExpr()
        consume('rbracket')
        expr = { type: 'Index', object: expr, index, line: expr.line }
      } else break
    }
    return expr
  }

  function parsePrimary() {
    const t = peek()
    if (match('number')) return { type: 'Literal', value: t.value, line: t.line }
    if (match('string')) return { type: 'Literal', value: t.value, line: t.line }
    if (match('bool')) return { type: 'Literal', value: t.value, line: t.line }
    if (match('null')) return { type: 'Literal', value: null, line: t.line }
    if (match('ident')) return { type: 'Ident', name: t.value, line: t.line }
    if (match('lparen')) {
      const e = parseExpr()
      consume('rparen')
      return e
    }
    if (match('lbracket')) {
      const elements = []
      if (!at('rbracket')) {
        elements.push(parseExpr())
        while (match('comma')) elements.push(parseExpr())
      }
      consume('rbracket')
      return { type: 'Array', elements, line: t.line }
    }
    throw new RuntimeError(`unexpected token '${t.type}'`, t.line)
  }

  return parseProgram()
}

// ─── Runtime ─────────────────────────────────────────────

class Environment {
  constructor(parent = null) {
    this.parent = parent
    this.map = Object.create(null)
  }
  define(name, value) {
    this.map[name] = value
  }
  get(name, line) {
    if (Object.prototype.hasOwnProperty.call(this.map, name)) return this.map[name]
    if (this.parent) return this.parent.get(name, line)
    throw new RuntimeError(`undefined variable '${name}'`, line)
  }
  set(name, value, line) {
    if (Object.prototype.hasOwnProperty.call(this.map, name)) {
      this.map[name] = value
      return
    }
    if (this.parent) {
      this.parent.set(name, value, line)
      return
    }
    throw new RuntimeError(`undefined variable '${name}'`, line)
  }
  entries() {
    const out = {}
    let env = this
    while (env) {
      Object.assign(out, env.map)
      env = env.parent
    }
    return out
  }
}

class ReturnSignal {
  constructor(value) {
    this.value = value
  }
}

function isTruthy(v) {
  if (v === null || v === false) return false
  if (v === 0 || v === '') return false
  return true
}

function typeName(v) {
  if (v === null) return 'null'
  if (Array.isArray(v)) return 'array'
  if (typeof v === 'function' || (v && v.__fn)) return 'fn'
  return typeof v
}

function repr(v) {
  if (v === null) return 'null'
  if (typeof v === 'string') return v
  if (typeof v === 'boolean') return v ? 'true' : 'false'
  if (Array.isArray(v)) return '[' + v.map(repr).join(', ') + ']'
  if (v && v.__fn) return `<fn ${v.name}>`
  if (typeof v === 'number') return String(v)
  return String(v)
}

function interpolate(str, env) {
  return String(str).replace(/\$\{([^}]+)\}/g, (_, raw) => {
    const key = raw.trim()
    try {
      return repr(env.get(key, 0))
    } catch {
      return '${' + key + '}'
    }
  })
}

function makeBuiltins(printFn, envRoot) {
  return {
    len: (a) => {
      if (typeof a === 'string' || Array.isArray(a)) return a.length
      throw new RuntimeError('len() expects string or array')
    },
    type: (a) => typeName(a),
    str: (a) => repr(a),
    num: (a) => {
      const n = Number(a)
      if (Number.isNaN(n)) throw new RuntimeError(`cannot convert to number: ${repr(a)}`)
      return n
    },
    abs: (a) => Math.abs(Number(a)),
    floor: (a) => Math.floor(Number(a)),
    ceil: (a) => Math.ceil(Number(a)),
    min: (...a) => Math.min(...a.map(Number)),
    max: (...a) => Math.max(...a.map(Number)),
    now: () => new Date().toLocaleString('ja-JP'),
    env: () =>
      `lang=${navigator.language} online=${navigator.onLine} ua=${navigator.userAgent.slice(0, 48)}…`,
    push: (arr, v) => {
      if (!Array.isArray(arr)) throw new RuntimeError('push() expects array')
      arr.push(v)
      return arr.length
    },
    pop: (arr) => {
      if (!Array.isArray(arr)) throw new RuntimeError('pop() expects array')
      return arr.pop()
    },
    join: (arr, sep = ',') => {
      if (!Array.isArray(arr)) throw new RuntimeError('join() expects array')
      return arr.map(repr).join(String(sep))
    },
    keys: () => Object.keys(envRoot.entries()).filter((k) => !k.startsWith('__')),
  }
}

function evaluate(node, env, ctx) {
  if (!node) return null
  switch (node.type) {
    case 'Program': {
      let last = null
      for (const s of node.body) last = evaluate(s, env, ctx)
      return last
    }
    case 'Block': {
      const local = new Environment(env)
      let last = null
      for (const s of node.body) last = evaluate(s, local, ctx)
      return last
    }
    case 'Let': {
      const v = evaluate(node.value, env, ctx)
      env.define(node.name, v)
      return v
    }
    case 'Assign': {
      const v = evaluate(node.value, env, ctx)
      if (node.target.type === 'Ident') {
        env.set(node.target.name, v, node.line)
        return v
      }
      if (node.target.type === 'Index') {
        const obj = evaluate(node.target.object, env, ctx)
        const idx = evaluate(node.target.index, env, ctx)
        if (!Array.isArray(obj)) throw new RuntimeError('index assign on non-array', node.line)
        obj[Number(idx)] = v
        return v
      }
      throw new RuntimeError('invalid assignment', node.line)
    }
    case 'If': {
      if (isTruthy(evaluate(node.cond, env, ctx))) return evaluate(node.then, env, ctx)
      if (node.else) return evaluate(node.else, env, ctx)
      return null
    }
    case 'While': {
      let guard = 0
      let last = null
      while (isTruthy(evaluate(node.cond, env, ctx))) {
        if (++guard > 100000) throw new RuntimeError('while: iteration limit exceeded', node.line)
        last = evaluate(node.body, env, ctx)
      }
      return last
    }
    case 'For': {
      const iter = evaluate(node.iter, env, ctx)
      let list
      if (Array.isArray(iter)) list = iter
      else if (iter && iter.__range) {
        list = []
        const a = iter.start
        const b = iter.end
        if (a <= b) for (let i = a; i <= b; i++) list.push(i)
        else for (let i = a; i >= b; i--) list.push(i)
      } else if (typeof iter === 'string') list = [...iter]
      else throw new RuntimeError('for: not iterable', node.line)
      let last = null
      for (const item of list) {
        const local = new Environment(env)
        local.define(node.name, item)
        last = evaluate(node.body, local, ctx)
      }
      return last
    }
    case 'Fn': {
      const fn = {
        __fn: true,
        name: node.name,
        params: node.params,
        body: node.body,
        closure: env,
      }
      env.define(node.name, fn)
      return fn
    }
    case 'Return':
      throw new ReturnSignal(node.value ? evaluate(node.value, env, ctx) : null)
    case 'Print': {
      const parts = node.args.map((a) => {
        const v = evaluate(a, env, ctx)
        if (typeof v === 'string') return interpolate(v, env)
        return repr(v)
      })
      ctx.print(parts.join(' '))
      return null
    }
    case 'ExprStmt':
      return evaluate(node.expr, env, ctx)
    case 'Literal':
      return node.value
    case 'Ident':
      return env.get(node.name, node.line)
    case 'Array':
      return node.elements.map((e) => evaluate(e, env, ctx))
    case 'Range': {
      const start = Number(evaluate(node.start, env, ctx))
      const end = Number(evaluate(node.end, env, ctx))
      return { __range: true, start, end }
    }
    case 'Unary': {
      const a = evaluate(node.arg, env, ctx)
      if (node.op === '-') return -Number(a)
      if (node.op === '!') return !isTruthy(a)
      throw new RuntimeError(`unknown unary ${node.op}`, node.line)
    }
    case 'Binary': {
      // short-circuit
      if (node.op === '&&') {
        const l = evaluate(node.left, env, ctx)
        return isTruthy(l) ? evaluate(node.right, env, ctx) : l
      }
      if (node.op === '||') {
        const l = evaluate(node.left, env, ctx)
        return isTruthy(l) ? l : evaluate(node.right, env, ctx)
      }
      const l = evaluate(node.left, env, ctx)
      const r = evaluate(node.right, env, ctx)
      switch (node.op) {
        case '+':
          if (typeof l === 'string' || typeof r === 'string') return String(l) + String(r)
          return Number(l) + Number(r)
        case '-':
          return Number(l) - Number(r)
        case '*':
          return Number(l) * Number(r)
        case '/':
          if (Number(r) === 0) throw new RuntimeError('division by zero', node.line)
          return Number(l) / Number(r)
        case '%':
          return Number(l) % Number(r)
        case '==':
          return l === r
        case '!=':
          return l !== r
        case '<':
          return l < r
        case '>':
          return l > r
        case '<=':
          return l <= r
        case '>=':
          return l >= r
        default:
          throw new RuntimeError(`unknown op ${node.op}`, node.line)
      }
    }
    case 'Call': {
      const callee = evaluate(node.callee, env, ctx)
      const args = node.args.map((a) => evaluate(a, env, ctx))
      if (typeof callee === 'function') return callee(...args)
      if (callee && callee.__fn) {
        if (args.length !== callee.params.length) {
          throw new RuntimeError(
            `fn ${callee.name} expects ${callee.params.length} args, got ${args.length}`,
            node.line
          )
        }
        const local = new Environment(callee.closure)
        callee.params.forEach((p, i) => local.define(p, args[i]))
        try {
          evaluate(callee.body, local, ctx)
          return null
        } catch (e) {
          if (e instanceof ReturnSignal) return e.value
          throw e
        }
      }
      throw new RuntimeError(`not callable: ${typeName(callee)}`, node.line)
    }
    case 'Index': {
      const obj = evaluate(node.object, env, ctx)
      const idx = evaluate(node.index, env, ctx)
      if (Array.isArray(obj) || typeof obj === 'string') {
        const i = Number(idx)
        if (i < 0 || i >= obj.length) throw new RuntimeError('index out of range', node.line)
        return obj[i]
      }
      throw new RuntimeError('cannot index ' + typeName(obj), node.line)
    }
    default:
      throw new RuntimeError(`unknown node ${node.type}`, node.line || 0)
  }
}

/**
 * @param {string} source
 * @param {{ print?: (s:string)=>void }} options
 * @returns {{ ok: boolean, output: string[], error?: string, vars: Record<string, unknown> }}
 */
export function runPilotScript(source, options = {}) {
  const output = []
  const print = (s) => {
    output.push(String(s))
    if (options.print) options.print(String(s))
  }
  try {
    const tokens = tokenize(source)
    const ast = parse(tokens)
    const env = new Environment()
    const builtins = makeBuiltins(print, env)
    for (const [k, v] of Object.entries(builtins)) env.define(k, v)
    // aliases
    env.define('help', () => {
      print(HELP_TEXT)
      return null
    })
    env.define('clear', () => {
      output.length = 0
      print('(output buffer cleared for this run — UI clear is separate)')
      return null
    })
    evaluate(ast, env, { print })
    const vars = env.entries()
    // strip builtins from dump
    const dump = {}
    for (const [k, v] of Object.entries(vars)) {
      if (typeof v === 'function' || (v && v.__fn && builtins[k])) continue
      if (builtins[k] !== undefined && typeof builtins[k] === 'function') continue
      if (k === 'help' || k === 'clear') continue
      dump[k] = v && v.__fn ? `<fn ${v.name}>` : v
    }
    return { ok: true, output, vars: dump }
  } catch (e) {
    const msg = e instanceof RuntimeError || e.message ? e.message : String(e)
    output.push('Error: ' + msg)
    return { ok: false, output, error: msg, vars: {} }
  }
}

export const HELP_TEXT = `
PilotScript v2
──────────────
Variables:
  let x = 10
  x = x + 1
  x += 2

Types: null, bool, number, string, array, fn

Control:
  if cond { ... } else { ... }
  while cond { ... }
  for i in 1..5 { ... }
  for item in arr { ... }

Functions:
  fn add(a, b) { return a + b }
  print add(2, 3)

Arrays:
  let a = [1, 2, 3]
  print a[0]
  push(a, 4)

Strings: "hello ${name}"  (interpolation via print)

Operators: + - * / %  == != < > <= >=  and or not

Builtins:
  print, len, type, str, num, abs, floor, ceil, min, max,
  now, env, push, pop, join, keys, help()

Comments: # ...  or  // ...
`.trim()

export const SAMPLE = [
  '# PilotScript v2 sample',
  'let name = "Pilot"',
  'print "Hello, ${name}!"',
  '',
  'let a = 21',
  'fn double(n) {',
  '  return n * 2',
  '}',
  'let answer = double(a)',
  'print "21 x 2 =" answer',
  '',
  'let nums = [1, 2, 3, 4, 5]',
  'let sum = 0',
  'for n in nums {',
  '  sum = sum + n',
  '}',
  'print "sum =" sum',
  '',
  'for i in 1..3 {',
  '  print "tick" i',
  '}',
  '',
  'if answer == 42 {',
  '  print "correct"',
  '} else {',
  '  print "unexpected"',
  '}',
  '',
  'print type(answer) len(nums) now()',
].join('\n')
