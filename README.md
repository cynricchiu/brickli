# Brickli

Ogma is a tool to facilitate the integration of safe runtime monitors into
other systems. Ogma extends
[Copilot](https://github.com/Copilot-Language/copilot), a high-level runtime
verification framework that generates hard real-time C99 code.

# Features

- Translating requirements defined in [NASA's requirements elicitation tool
  FRET](https://github.com/NASA-SW-VnV/fret) into corresponding monitors in
  Copilot.

- Generating [NASA Core Flight System](https://cfs.gsfc.nasa.gov/) applications
  that use Copilot for monitoring data received from the message bus.

- Generating message handlers for NASA Core Flight System applications to make
  external data in structs available to a Copilot monitor.

- Generating the glue code necessary to work with C structs in Copilot.

- Generating [Robot Operating System](https://ros.org) applications that use
  Copilot for monitoring data published in different topics.

## Table of Contents

- [Brickli](#brickli)
- [Features](#features)
  - [Table of Contents](#table-of-contents)
- [Installation](#installation)
  - [Pre-requisites](#pre-requisites)


# Installation
<sup>[(Back to top)](#table-of-contents)</sup>

## Pre-requisites
<sup>[(Back to top)](#table-of-contents)</sup>

To install Ogma from source, users must have the tools GHC and cabal-install.
At this time, we recommend GHC 8.6 and a version of cabal-install between 2.4
and 3.2. (Ogma has been tested with GHC versions up to 9.2 and cabal-install
versions up to 3.6, although the installation steps may vary slightly depending
on the version of cabal-install being used.)

On Debian or Ubuntu Linux, both can be installed with:

```sh
$ apt-get install ghc cabal-install
```

On Mac, they can be installed with:

```sh
$ brew install ghc cabal-install
```
