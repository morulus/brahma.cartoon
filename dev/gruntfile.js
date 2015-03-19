module.exports = function(grunt) {

	grunt.initConfig({
		bowerjson: grunt.file.readJSON('../bower.json'),
		/*less: {
			styles: {
		        options: {
		          compress: false,
		          yuicompress: true,
		          optimization: 2
		        },
		        files: {
		          // target.css file: source.less file
		          "../dist/brahma.screens.css": "./less/main.less"
		        }
	      	}
		},*/
		snipper: {
	      js: {
	        files: {
	          '../dist/': ['./js/brahma.cartoon.js']
	        }
	      }
	    },
	    banner: '212',
	    usebanner: {
		    dist: {
				options: {
					position: 'top',
					banner: '<%= banner %>'
				},
				files: {
					src: ['../dist/<%=bowerjson.main.join("','")%>']
				}
		    }
		},
	    uglify: {
	      minone: {
	        options: {
	          mangle: false,
	          compress: true,
	          sourceMap: true,
	          preserveComments: 'some'
	        },
	        files: {
	          '../dist/<%=bowerjson.name%>.min.js': ['../dist/<%=bowerjson.name%>.js']
	        }
	      }
	    },
	    watch: {
	      js: {
	        files: ['./js/**/*.js'], // which files to watch
	        tasks: ['snipper:js','usebanner','uglify:minone'],
	        options: {
	          nospawn: true
	        }
	      }
	    },
		increase: {
			tick: {
				degree: 3,
				json:  '../bower.json',
				report: {'../UPDATES.md':'## Versions'}
			},
			model: {
				degree: 2,
				json:  '../bower.json',
				report: {'../UPDATES.md':'## Versions'}
			},
			version: {
				degree: 1,
				json:  '../bower.json',
				report: {'../UPDATES.md':'## Versions'}
			}
		}
	});

	grunt.loadNpmTasks('grunt-snipper');
	//grunt.loadNpmTasks('grunt-contrib-less');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	//grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-increase');
	//grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-banner');

	grunt.registerTask('default', ['snipper:js','usebanner:dist',/*,'less:styles',*/'uglify:minone','watch']);
	grunt.registerTask('up-tick', ['increase:tick']);
	grunt.registerTask('up-model', ['increase:model']);
	grunt.registerTask('up-version', ['increase:version']);
	grunt.registerTask('build', ['snipper:js', /*'less:styles',*/ 'usebanner:dist', /*'cssmin:dist',*/ 'uglify:minone', 'concat', /*'cssmin:jquery',*/ /*'uglify:minbuild',*/]);
};