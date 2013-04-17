#!/usr/bin/env python

# modified from three.js/utils/build.py

import argparse
import json
import os
import shutil
import sys
import tempfile


def main(argv=None):

	# need to know where this script is executing from?
	#for dirname, dirnames, filenames in os.walk('.'):
	#	for filename in filenames:
	#		print os.path.join(dirname, filename)

	parser = argparse.ArgumentParser()
	parser.add_argument('--minify', action='store_true', default=False)
	parser.add_argument('--output', default='../build/kwente.js')
	parser.add_argument('--sourcemaps', action='store_true', default=False)

	args = parser.parse_args()

	output = args.output

	# merge

	print(' * Building ' + output)

	fd, path = tempfile.mkstemp()
	tmp = open(path, 'w')
	sources = []
	for r,d,f in os.walk("../src"):
		for filesFound in f:
			if filesFound.endswith(".js"):
				sources.append( os.path.join(r,filesFound) )
				
	#print sources 

	for source in sources:
		print('   * Adding ' + source)
		with open(source, 'r') as f: tmp.write( "// ---------- " + source + " ---------- //\n" + f.read() + "\n\n\n" )
		#with open(source, 'r') as f: tmp.write( "/**\t--\t" + source + "\t--\t**/\n" + f.read() + "\n\n" )

	tmp.close()
	
	# save

	shutil.copy(path, output)
	os.chmod(output, 0o664); # temp files would usually get 0600
	
	print('   * FINISHED!')

	if args.minify is True:
	
		print(' * Minify-ing...')

		#externs = ' --externs '.join(args.externs)
		source = ' '.join(sources)
		output_min = '../build/kwente.min.js'
		#cmd = 'java -jar compiler/compiler.jar --warning_level=VERBOSE --jscomp_off=globalThis --externs %s --jscomp_off=checkTypes --language_in=ECMASCRIPT5_STRICT --js %s --js_output_file %s %s' % (externs, source, output, sourcemapargs)
		cmd = 'java -jar compiler/compiler.jar --warning_level=VERBOSE --jscomp_off=globalThis --jscomp_off=checkTypes --language_in=ECMASCRIPT5_STRICT --js %s --js_output_file %s' % (source, output_min )
		os.system(cmd)
		
		print('   * Compiler finished')

		# header

		print('   * Final edits...')
		with open(output_min,'r') as f: text = f.read()
		with open(output_min,'w') as f: f.write('// kwente.js - url here\n' + text )
		
		print('   * FINISHED!')

	os.close(fd)
	os.remove(path)

	


if __name__ == "__main__":
	main()

