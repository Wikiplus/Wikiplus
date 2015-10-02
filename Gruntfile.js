module.exports = function (grunt) {
    require('load-grunt-tasks')(grunt); // npm install --save-dev load-grunt-tasks 
 
    grunt.initConfig({
        uglify: {
            options: {
            },
            app_task: {
                files: {
                    './Main.min.js': './Main.js'
                }
            }
        },
        babel: {
            options: {
                sourceMap: false
            },
            dist: {
                files: {
                    './Main.js': './Main.new.js'
                }
            }
        },
        watch: {
            another: {
                files: ['./Main.new.js'],
                tasks: ['babel','uglify'],
                options: {
                    // Start another live reload server on port 1337
                    livereload: 1337
                }
            }
        }
    });
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.registerTask('default', ['watch']);
}