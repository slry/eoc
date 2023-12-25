/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2022-2023 Objectionary.com
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

const rel = require('relative');
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const {runSync, assertFilesExist} = require('../helpers');

describe('compile', function() {
  it('compiles a simple .EO program into Java bytecode .class files', function(done) {
    home = path.resolve('temp/test-compile/simple');
    fs.rmSync(home, {recursive: true, force: true});
    fs.mkdirSync(path.resolve(home, 'src'), {recursive: true});
    fs.writeFileSync(path.resolve(home, 'src/compile.eo'), simple('compile'));
    const stdout = runSync([
      'compile',
      '--parser=0.34.1',
      '--hash=1d605bd872f27494551e9dd2341b9413d0d96d89',
      '-s', path.resolve(home, 'src'),
      '-t', path.resolve(home, 'target'),
    ]);
    assertFilesExist(
      stdout, home,
      [
        'target/generated-sources/EOfoo/EObar/EOcompile.java',
        'target/generated-sources/EOorg/EOeolang/EObytes.java',
        'target/classes/EOfoo/EObar/EOcompile.class',
        'target/classes/org/eolang/Phi.class',
        'target/classes/EOorg/EOeolang/EOint.class',
      ]
    );
    assert(!fs.existsSync(path.resolve('../../mvnw/target')));
    done();
  });

  it('compiles a simple .EO unit test into Java bytecode .class files', function(done) {
    home = path.resolve('temp/test-compile/junit');
    fs.rmSync(home, {recursive: true, force: true});
    fs.mkdirSync(path.resolve(home, 'src'), {recursive: true});
    fs.writeFileSync(
      path.resolve(home, 'src/simple-test-compile.eo'),
      [
        '+package foo.bar',
        '+junit',
        '',
        '[] > simple-test-compile',
        '  TRUE > @',
        '',
      ].join('\n')
    );
    const stdout = runSync([
      'compile',
      '--verbose',
      '--parser=0.34.1',
      '--hash=1d605bd872f27494551e9dd2341b9413d0d96d89',
      '-s', path.resolve(home, 'src'),
      '-t', path.resolve(home, 'target'),
    ]);
    assertFilesExist(
      stdout, home,
      [
        'target/generated-sources/EOfoo/EObar/EOsimple_test_compileTest.java',
        'target/classes/EOfoo/EObar/EOsimple_test_compileTest.class',
      ]
    );
    done();
  });

  it('Cleans and compiles a simple .EO program', function(done) {
    home = path.resolve('temp/test-compile/simple');
    fs.rmSync(home, {recursive: true, force: true});
    fs.mkdirSync(path.resolve(home, 'src'), {recursive: true});
    fs.writeFileSync(path.resolve(home, 'src/compile2.eo'), simple('compile2'));
    const stdout = runSync([
      'compile',
      '--clean',
      '--parser=0.34.1',
      '--hash=1d605bd872f27494551e9dd2341b9413d0d96d89',
      '-s', path.resolve(home, 'src'),
      '-t', path.resolve(home, 'target'),
    ]);
    assert(stdout.includes(`The directory ${rel(path.resolve(home, 'target'))} deleted`), stdout);
    done();
  });
});

/**
 * Creates simple correct eo program.
 * @param {string} name - Name of object
 * @return {string} simple eo program
 */
function simple(name) {
  return [
    '+package foo.bar',
    '+alias org.eolang.io.stdout',
    '',
    `[args] > ${name}`,
    '  stdout "Hello, world!" > @',
  ].join('\n');
}
