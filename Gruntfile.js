module.exports = function(grunt){
	grunt.initConfig({
		express:{
			dev: {
				options:{
					script: './bin/www'
				}
			}
		},
		watch:{
			options:{
				livereload: true
			},
			express:{
				files: ['./app.js', './server/routes/*.js', './server/config/*.js'],
				tasks:['express:dev'],
				options:{
					spawn: false
				}
			},
			public:{
				files: ['./server/views/*.jade', './public/stylesheets/style.css']
			}
		}
		
	});

	grunt.loadNpmTasks('grunt-express-server');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-concat');

	grunt.registerTask('default', ['express:dev', 'watch']);

	grunt.registerTask('jshint', ['jshint']);
};