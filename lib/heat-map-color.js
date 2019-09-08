import hsl from 'hsl-to-hex'

export default function heatMapColor(value) {
  if(value > 1) throw "heatMapColor: value must be in range (0..1)"

  const h = (1 - value) * 80
  const s = 100
  const l = 40

  return hsl(h, s, l)
}
