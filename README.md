# Phytoplankton - Living Style Guide


## Generate bootstrap-like documentation for your own CSS!

This project aims at making sure your style sheets are fully documented whilst being synchronized with your project styles.

To do this, it actually uses your style sheets so that, at anytime, you can review how your style guide looks.


## Main goals and benefits

* Fully documented CSS - No need to explain the benefits.
* No dependencies, simply download the repository and run it in your browser.
* Automatic generation of demo UI components.
* Easy access for anyone: designers, developers, managers, users, etc.
* Rapid development of projects by allowing developers to find the correct CSS and HTML for any given UI component.
* Open sourced so that all great ideas can be included.


## Installation

1. Download the repository `git clone https://github.com/hiulit/kaleistyleguide.git`.
2. Serve it on a HTTP server (or a local environment using [MAMP](http://www.mamp.info/),
 [XAMPP](http://www.apachefriends.org/), etc.) and it should work!


## Inspiration and alternatives

Phytoplankton is heavily influenced by the following projects and blog posts:

* [Pea.rs](http://pea.rs/)
* [KSS](http://warpspire.com/posts/kss/)
* [StyleDocco](http://jacobrask.github.com/styledocco/)
* [Anchoring Your Design Language in a Live Style Guide](http://uxmag.com/articles/anchoring-your-design-language-in-a-live-style-guide)
* [Nadarei KSS](http://nadarei.co/nkss-rails/) - rails


## Technologies

Mad propz to all the great people behind the software listed below.

* [marked.js](https://github.com/chjj/marked) - Full-featured markdown parser and compiler in Javascript.
* [jscssp](http://www.glazman.org/JSCSSP/) - CSS parser in JavaScript.
* [Less](http://lesscss.org/) - CSS pre-prepocessor
* [sass.js](https://github.com/medialize/sass.js) - API for emscripted libsass to run in the browser.
* [Fixie.js](https://github.com/ryhan/fixie) - Automatically add filler content to HTML documents.
* [Prism](http://prismjs.com/) - Lightweight, robust, elegant syntax highlighting.
* [Backbone.js](http://backbonejs.org/)
* [Underscore.js](http://underscorejs.org/)
* [jQuery](http://jquery.com)


## Pre-pocessors support

* [Sass](http://sass-lang.com/) (v3.2.16) + [Bourbon](http://bourbon.io/)
* [Less](http://lesscss.org/) (v1.7.0)

## Notes

Why don't you use the latest version of Sass (v3.3.4)?

Phytoplankton uses [sass.js](https://github.com/medialize/sass.js) for having Sass in the browser
([not a trivial task](http://blog.rodneyrehm.de/archives/33-libsass.js-An-Emscripten-Experiment.html), btw)
which in turn uses [libsass](https://github.com/hcatlin/libsass). The guys behind sass.js are [waiting for an
official libasss release](https://twitter.com/rodneyrehm/status/447009238561595392).

## Browser support

* Chrome
* Firefox
* IE 8+

### Notes

Say whaaaa...?!! Did I just see that you support IE 8+?

Well... If you want to pimp your experience and leverage [sass.js](https://github.com/medialize/sass.js) and [Prism](http://prismjs.com/),
please ensure you use a real browser **IE 10+**.
If not, you can still use plain, old boring CSS. Or try using [Less](http://lesscss.org/).

Not tested on Opera.


## Changelog

* `0.1.0` Not officially released.


## Author/s

* [Thomas Davis](http://thomasdavis.github.com)

### This fork's author

* Me, [Xavier Gómez](https://github.com/hiulit) ([@hiulit](https://twitter.com/hiulit))


## Contributors

Mad propz again for these guys:

* [Luke Brooker](http://lukebrooker.com/)
* [Oriol Torras](https://github.com/otorras) ([@uriusfurius](https://twitter.com/uriusfurius))


## License

Public domain: http://unlicense.org/
