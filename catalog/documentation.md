# Documentation

View and manage millions of containers in context - in New Relic One.

## Usage

Container Explorer displays a global view of all of the containers in an account.

CPU, Memory and Disk I/O is presented in a space efficient heat map.

Clicking on a node in the heatmap displays details about that container, and jumps to its host in the entity explorer.

## Open Source License

This project is distributed under the [Apache 2 license](https://github.com/newrelic/nr1-container-explorer/blob/main/LICENSE).

## Dependencies

Requires [`New Relic Infrastructure`](https://newrelic.com/products/infrastructure) agent deployed on hosts running Docker containers.

## Caveats

We generate per-container CPU etc by summarizing all processes in a given containerId. For example, this query
will report CPU for a single container for the last minute:

```sql
SELECT sum(cpuPercent) FROM ProcessSample WHERE containerId = '${containerId}'
    SINCE 1 minute ago UNTIL 30 seconds ago
```

**However:** This will report an accurate value _only if the agent reports one ProcessSample_ per process
every 30 seconds. If the agent reports once every 15 second, then we would get 2x the value for this query.
I'm looking to add a capability to estimate the reporting rate per process per container, but note that this
reporting rate can vary by host depending on agent config.

If a set of viewed containers all report a the same rate heatmap colorization will be consistent irrespective of
an agent's reporting rate. But the reported absolute values may be off.

The infrastructure team is working on agent changes that will properly report by container, at which point
we can convert to using that data.

## Getting started

First, ensure that you have [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) and [NPM](https://www.npmjs.com/get-npm) installed. If you're unsure whether you have one or both of them installed, run the following command(s) (If you have them installed these commands will return a version number, if not, the commands won't be recognized):

```bash
git --version
npm -v
```

Next, clone this repository and run the following scripts:

```bash
git clone https://github.com/newrelic/nr1-container-explorer.git
cd nr1-container-explorer
npm install
npm start
```

Visit [https://one.newrelic.com/?nerdpacks=local](https://one.newrelic.com/?nerdpacks=local), navigate to the Nerdpack, and :sparkles:

## Deploying this Nerdpack

Open a command prompt in the nerdpack's directory and run the following commands.

```bash
# To create a new uuid for the nerdpack so that you can deploy it to your account:
# nr1 nerdpack:uuid -g [--profile=your_profile_name]

# To see a list of APIkeys / profiles available in your development environment:
# nr1 profiles:list

nr1 nerdpack:publish [--profile=your_profile_name]
nr1 nerdpack:deploy [-c [DEV|BETA|STABLE]] [--profile=your_profile_name]
nr1 nerdpack:subscribe [-c [DEV|BETA|STABLE]] [--profile=your_profile_name]
```

Visit [https://one.newrelic.com](https://one.newrelic.com), navigate to the Nerdpack, and :sparkles:

## Community Support

New Relic hosts and moderates an online forum where you can interact with New Relic employees as well as other customers to get help and share best practices. Like all New Relic open source community projects, there's a related topic in the New Relic Explorers Hub. You can find this project's topic/threads here:

[https://discuss.newrelic.com/t/container-explorer-nerdpack/90565](https://discuss.newrelic.com/t/container-explorer-nerdpack/90565)

Please do not report issues with Container Explorer to New Relic Global Technical Support. Instead, visit the [`Explorers Hub`](https://discuss.newrelic.com/c/build-on-new-relic) for troubleshooting and best-practices.

## Issues / Enhancement Requests

Issues and enhancement requests can be submitted in the [Issues tab of this repository](https://github.com/newrelic/nr1-container-explorer/issues). Please search for and review the existing open issues before submitting a new issue.

## Contributing

Contributions are welcome (and if you submit a Enhancement Request, expect to be invited to contribute it yourself :grin:). Please review our [Contributors Guide](https://github.com/newrelic/nr1-container-explorer/blob/main/CONTRIBUTING.md).

Keep in mind that when you submit your pull request, you'll need to sign the CLA via the click-through using CLA-Assistant. If you'd like to execute our corporate CLA, or if you have any questions, please drop us an email at opensource@newrelic.com.
