module.exports = function(grunt) {
  grunt.initConfig({
    less: {
      development: {
        options: {
          compress: true,
          yuicompress: true,
          optimization: 2,
          sourceMap: false
        },
        files: {
          // target.css file: source.less file
          "../styles/custom.css": ["./less/theme/main.less","./less/custom/main.less"]
        }
      }
    },
    uglify: {
      my_target: {
        options: {
          mangle: false
        },
        files: {
          '../mrls/js/main.min.js': ['./scripts/*.js']
        }
      }
    },
    watch: {
      styles: {
        files: ['./less/**/*.less'], // which files to watch
        tasks: ['less'],
        options: {
          nospawn: true
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-uglify');


  grunt.registerTask('default', ['less', 'watch']);
};