# TODO

## Refactor / rebuild parser

Goal: 

1. Separate tokenize and parsing
2. Use Djikstra's Shunting Yard algorithm to convert the Infix token list notation to Postfix, and use it to build the AST
   instead the today's loop-based parser

Inspiration: c't Author Oliver Lau's APC::

* https://607011.github.io/bincalc/
* https://github.com/607011/bincalc/blob/master/numbercruncher.js

### Tokenizing

- create a `tokenize` function, based on the today's `_do_parse()` function
- create Token objects with metadata (type, value, position, etc.)
- input is still a string, but the result is an array of tokens, instead of a string


### Parsing

- operate on token list
- implement Shunting Yard algorithm
- work on Token list, create Expression objects on the go
- create AST from Shunting Yard output
- goal: as today, one single top level expression object as output

## Get rid of the short varibale form

Get rid of the short form `3x` instead of `3*x`: It makes variable handling and parsing much more complex, and makes it necessary to
explicitly mark longer variable names. Today, longer variable names are surrounded by `[]`. As I want to implement lists/arrays in formulas,
and `[]` is the common syntax for lists, I will introduce a breaking change in the **next major release**, removing this form.
