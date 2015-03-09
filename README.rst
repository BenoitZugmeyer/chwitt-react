Chwitt
======

This project goal is to provide a nice Twitter client for Linux, as
hotot_ is not active anymore.

Everything has to be done: expect a lot of changes before it can be usable.

Running pre-built binaries (Linux x64 only)
-------------------------------------------

Use it if you want to try `chwitt-react` using a production-like build. Keep
in mind that everything is still really messy.

::

    wget http://graou.eu/~alk/chwitt-react-1.0.0-dev-2d62184.tgz
    tar xvzf chwitt-react-1.0.0-dev-2d62184.tgz
    chwitt-react-1.0.0-dev-2d62184/chwitt-react


Running development version
---------------------------

Use it if you want to devolop on `chwitt-react`. This will launch the program
and watch the files automatically, recompiling and reloading modules on the fly.

::

    git clone git+https://github.com/BenoitZugmeyer/chwitt-react
    cd chwitt-react
    npm install
    npm start


.. _hotot: https://github.com/lyricat/Hotot
