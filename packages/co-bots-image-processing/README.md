# Co-Bots image processing

This package contains image processing functions for Co-Bots: i.e. the steps to parse the input traits and to generate
the output so-called "palette" in a json suitable for on-chain encoding.

## Installation

The project relies on [poetry](https://python-poetry.org/) so make sure you have it installed.

Then the following command can be used to install the package:

```bash
poetry install
```

The project relies on [dvc](https://dvc.org/) for data versioning. It is a python package installed when installing
the project.

Data artifacts are stored in the `data` folder and backed up in the `s3://co-bots` AWS bucket.

With credentials for the AWS account either at the default place (`~/.aws/credentials`) or in an dvc `config.local` file
you can retrieve the latest artifacts using:

```bash
poetry run dvc pull
```

Note: [pyenv](https://github.com/pyenv/pyenv-installer) is the recommended way of managing python versions.
