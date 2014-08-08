browserify = ./node_modules/browserify/bin/cmd.js
uglify = ./node_modules/uglify-js/bin/uglifyjs
jshint = jshint

all: bundle.js bundle.min.js

bundle.js: index.js
	$(browserify) $< > $@

%.min.js: %.js
	$(uglify) $< > $@

lint:
	$(jshint) --verbose --config .jshintrc index.js

test:
	npm test

clean:
	rm -f bundle*.js
