import bytesToSize from './bytes-to-size';

const MEGABYTE = 1024 * 1024;
const GIGABYTE = MEGABYTE * 1024;
const PLOTS = [
  {
    select: 'sum(cpuPercent) AS cpu',
    title: 'CPU',
    formatValue: (value) => `${value.toFixed(1)}%`,
    max: (max) => Math.ceil(max / 100) * 100,
  },
  {
    select: 'sum(memoryResidentSizeBytes) AS memory',
    title: 'Memory',
    formatValue: (value) => bytesToSize(value),
    max: (max) => Math.ceil(max / GIGABYTE) * GIGABYTE,
  },
  {
    select: 'sum(ioReadBytesPerSecond+ioWriteBytesPerSecond) AS io',
    title: 'Disk I/O',
    formatValue: (value) => `${bytesToSize(value)}/s`,
    max: (max) => Math.ceil(max / MEGABYTE) * MEGABYTE,
  },
];

export default PLOTS;
