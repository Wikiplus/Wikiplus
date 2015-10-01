require('load-grunt-tasks')(grunt); // npm install --save-dev load-grunt-tasks 
 
grunt.initConfig({
    babel: {
        options: {
            sourceMap: true
        },
        dist: {
            files: {
                'Wikiplus.new.js': 'Wikiplus.js'
            }
        }
    }
});
 
grunt.registerTask('default', ['babel']);