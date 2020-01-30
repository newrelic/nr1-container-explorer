import nrdbQuery from '../../lib/nrdb-query';

/* estimates the reporting rate of process sample data in seconds. */
export default async function getProcessSamplePeriod(accountId, where) {
  const whereClause = where ? `WHERE ${where}` : '';
  const nrql = `SELECT count(*) / uniqueCount(entityAndPid) as samplePeriod
      FROM ProcessSample ${whereClause} SINCE 2 minutes ago until 1 minute ago`;
  const results = await nrdbQuery(accountId, nrql);
  const samplesPerMinute = Math.round(results[0].samplePeriod);
  const samplePeriod = 60 / samplesPerMinute;

  return samplePeriod;
}
