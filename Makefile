jshint = jshint

lint:
	$(jshint) --verbose --config .jshintrc index.js
