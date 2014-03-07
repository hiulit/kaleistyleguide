# Kalei - Style guide

This is a **fork** from [Thomas Davis' Kalei - Style guide](https://github.com/thomasdavis/kaleistyleguide).


## Generate bootstrap-like documentation for your own CSS!

This project aims at making sure your style sheets are fully documented whilst being synchronized with your project styles.

To do this, it actually uses your live style sheets in so that, at anytime, you can review how your style guide looks.


## Main goals and benefits

* Fully documented CSS - No need to explain the benefits.
* No dependencies, simply download the repository and run it in your browser.
* Automatic generation of demo UI components.
* Easy access for anyone: designers, developers, managers, users, etc.
* Rapid development of projects by allowing developers to find the correct CSS and HTML for any given UI component.
* Open sourced so that all great ideas can be included.


## Getting started

1. Download the repository `git clone https://github.com/hiulit/kaleistyleguide.git`.
2. Serve it on a HTTP server (or a local environment using [MAMP](http://www.mamp.info/) or
[XAMPP](http://www.apachefriends.org/), etc.) and it should work!
3. Edit `js/config.js` to point at your own style sheets.


## How to document your style sheets

It's all about the **comments** :)

One of the great things about Kalei is that you can use the same style sheets you're using right now in your project.
How cool is that, right?

You just need to comment your style sheets and then, boom...!! The magic happens!

You end up with a fully documented style sheet and a beautifully auto-generated living style guide for the same price.
What a deal!


## Author

* [Thomas Davis](http://thomasdavis.github.com)


## This fork's author

* [Xavier Gómez (a.k.a hiulit)](https://github.com/hiulit)


## Contributors

Many thanks to:

* [Luke Brooker](http://lukebrooker.com/)
* [Oriol Torras](https://github.com/otorras)

## Inspiration

Kalei is heavily influenced by the following projects and blog posts:

* [Pea.rs](http://pea.rs/)
* [KSS](http://warpspire.com/posts/kss/)
* [StyleDocco](http://jacobrask.github.com/styledocco/)
* [Anchoring Your Design Language in a Live Style Guide](http://uxmag.com/articles/anchoring-your-design-language-in-a-live-style-guide)
* [Nadarei KSS](http://nadarei.co/nkss-rails/) - rails


## Technologies

Many thanks to all the great people behind the software listed below.

* [marked](https://github.com/chjj/marked) - Full-featured markdown parser and compiler in Javascript.
* [jscssp](http://www.glazman.org/JSCSSP/) - CSS parser in JavaScript.
* [sass.js](https://github.com/medialize/sass.js) - API for emscripted libsass to run in the browser.
* [Fixie.js](https://github.com/ryhan/fixie) - Automatically add filler content to HTML documents.
* [Prism](http://prismjs.com/) - Lightweight, robust, elegant syntax highlighting.
* [Backbone.js](http://backbonejs.org/)
* [Underscore.js](http://underscorejs.org/)
* [jQuery](http://jquery.com)


## Browser support

* Chrome
* Firefox
* IE 8+


## Notes

Support for [sass.js](https://github.com/medialize/sass.js) and [Prism](http://prismjs.com/) is **IE 9+**.
You can still use Kalei for plain CSS.


## License

Public domain: http://unlicense.org/
