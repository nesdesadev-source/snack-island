import type { Voucher } from '../../models'
import { VOUCHER_VALID_DAYS, formatVoucherDate } from './voucherUtils'

export interface VoucherImageText {
  headline: string
  reward: string
  thanks: string
  code: string
  validUntil: string
  steps: string[]
  rules: string[]
}

export function buildVoucherImageText(voucher: Pick<Voucher, 'code' | 'expires_at'>, burgerName: string): VoucherImageText {
  return {
    headline: 'FREE BURGER',
    reward: `1 ${burgerName}, on us!`,
    thanks: 'Thanks for tagging Island Snack Bar on your IG story',
    code: voucher.code,
    validUntil: `Valid until ${formatVoucherDate(voucher.expires_at)}`,
    steps: [
      'Visit the Island Snack Bar food cart.',
      'Show this voucher code to our staff.',
      `Enjoy your free ${burgerName}!`,
    ],
    rules: [
      `One free ${burgerName} per code.`,
      'One-time use only.',
      `Valid for ${VOUCHER_VALID_DAYS} days from issue.`,
      'You can choose flavors, but no upgrades.',
      'Voucher burgers are a separate order. Extra items are paid separately.',
      'Not convertible to cash.',
    ],
  }
}

export function voucherImageFileName(code: string): string {
  return `island-snack-bar-voucher-${code}.png`
}

const W = 1080
const H = 1350
const COLORS = {
  cream: '#FFF6E5',
  green: '#0E3B2E',
  greenSoft: '#1F5E4B',
  orange: '#D9622B',
  sun: '#F2B544',
  ink: '#1D1D1F',
  muted: '#5B5B5F',
}
const FONT = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let line = ''
  for (const word of words) {
    const next = line ? `${line} ${word}` : word
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line)
      line = word
    } else {
      line = next
    }
  }
  if (line) lines.push(line)
  return lines
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

/** Draws the voucher as a 1080×1350 PNG (Instagram portrait size). */
export async function renderVoucherImage(
  voucher: Pick<Voucher, 'code' | 'expires_at'>,
  burgerName: string,
  logoSrc: string,
): Promise<Blob> {
  const text = buildVoucherImageText(voucher, burgerName)
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Canvas is not supported on this device')

  // Background + sun circle behind the logo
  ctx.fillStyle = COLORS.cream
  ctx.fillRect(0, 0, W, H)
  ctx.fillStyle = COLORS.sun
  ctx.globalAlpha = 0.18
  ctx.beginPath()
  ctx.arc(W / 2, 190, 260, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 1

  try {
    const logo = await loadImage(logoSrc)
    const size = 250
    ctx.drawImage(logo, (W - size) / 2, 50, size, size * (logo.height / logo.width))
  } catch {
    // Logo failed to load; the voucher is still usable without it
  }

  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'

  ctx.fillStyle = COLORS.green
  ctx.font = `800 40px ${FONT}`
  ctx.fillText('ISLAND SNACK BAR', W / 2, 340)

  ctx.fillStyle = COLORS.orange
  ctx.font = `900 108px ${FONT}`
  ctx.fillText(text.headline, W / 2, 445)

  ctx.fillStyle = COLORS.ink
  ctx.font = `600 38px ${FONT}`
  ctx.fillText(text.reward, W / 2, 500)

  ctx.fillStyle = COLORS.muted
  ctx.font = `400 28px ${FONT}`
  ctx.fillText(text.thanks, W / 2, 542)

  // Code box
  const boxX = 140
  const boxY = 574
  const boxW = W - 280
  const boxH = 180
  ctx.fillStyle = '#FFFFFF'
  roundRect(ctx, boxX, boxY, boxW, boxH, 28)
  ctx.fill()
  ctx.setLineDash([18, 12])
  ctx.lineWidth = 5
  ctx.strokeStyle = COLORS.green
  ctx.stroke()
  ctx.setLineDash([])

  ctx.fillStyle = COLORS.muted
  ctx.font = `700 24px ${FONT}`
  ctx.fillText('VOUCHER CODE', W / 2, boxY + 50)
  ctx.fillStyle = COLORS.green
  ctx.font = `800 92px ui-monospace, "SF Mono", Menlo, Consolas, monospace`
  ctx.fillText(text.code, W / 2, boxY + 140)

  ctx.fillStyle = COLORS.orange
  ctx.font = `700 30px ${FONT}`
  ctx.fillText(text.validUntil, W / 2, boxY + boxH + 48)

  // How to redeem + rules
  const left = 110
  const maxW = W - left * 2
  let y = 862
  ctx.textAlign = 'left'

  ctx.fillStyle = COLORS.green
  ctx.font = `800 30px ${FONT}`
  ctx.fillText('HOW TO REDEEM', left, y)
  y += 44
  ctx.font = `500 27px ${FONT}`
  ctx.fillStyle = COLORS.ink
  text.steps.forEach((step, i) => {
    ctx.fillText(`${i + 1}. ${step}`, left, y)
    y += 38
  })

  y += 22
  ctx.fillStyle = COLORS.green
  ctx.font = `800 30px ${FONT}`
  ctx.fillText('RULES', left, y)
  y += 40
  ctx.font = `400 23px ${FONT}`
  ctx.fillStyle = COLORS.muted
  for (const rule of text.rules) {
    for (const [i, line] of wrapLines(ctx, rule, maxW - 30).entries()) {
      ctx.fillText(i === 0 ? `•  ${line}` : `    ${line}`, left, y)
      y += 31
    }
  }

  // Footer band
  ctx.fillStyle = COLORS.green
  ctx.fillRect(0, H - 56, W, 56)
  ctx.fillStyle = COLORS.cream
  ctx.textAlign = 'center'
  ctx.font = `600 24px ${FONT}`
  ctx.fillText('See you at Island Snack Bar!', W / 2, H - 20)

  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => (blob ? resolve(blob) : reject(new Error('Could not create image'))), 'image/png')
  })
}
