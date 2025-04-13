# create-studiocms

## 0.2.0

### Minor Changes

- [#17](https://github.com/withstudiocms/cli-utilities/pull/17) [`48d0a74`](https://github.com/withstudiocms/cli-utilities/commit/48d0a74da3838480c9dd0b7d64a803569eb6c82e) Thanks [@Adammatthiesen](https://github.com/Adammatthiesen)! - Migrate internal helpers to new @withstudiocms/cli-kit

### Patch Changes

- [#19](https://github.com/withstudiocms/cli-utilities/pull/19) [`1c8940a`](https://github.com/withstudiocms/cli-utilities/commit/1c8940a276681f0f244edfec164bf01b547565db) Thanks [@Adammatthiesen](https://github.com/Adammatthiesen)! - fix import, pathUtil was previously exported as default by mistake, fixed as named export

- Updated dependencies [[`1c8940a`](https://github.com/withstudiocms/cli-utilities/commit/1c8940a276681f0f244edfec164bf01b547565db), [`48d0a74`](https://github.com/withstudiocms/cli-utilities/commit/48d0a74da3838480c9dd0b7d64a803569eb6c82e)]:
  - @withstudiocms/cli-kit@0.1.0

## 0.1.3

### Patch Changes

- [#12](https://github.com/withstudiocms/create-studiocms/pull/12) [`2f8f5e2`](https://github.com/withstudiocms/create-studiocms/commit/2f8f5e2295ffe3f23785e4502de31f34eb46bec0) Thanks [@dreyfus92](https://github.com/dreyfus92)! - Fixes undefined Turso DB credentials in environment files and add validation

## 0.1.2

### Patch Changes

- [#10](https://github.com/withstudiocms/create-studiocms/pull/10) [`6aca9c4`](https://github.com/withstudiocms/create-studiocms/commit/6aca9c4abda663f05955671731e962ced8b18add) Thanks [@dreyfus92](https://github.com/dreyfus92)! - Fix CLI interactive environment builder with two important changes:
  1. Fixed token validation in Turso authentication to properly handle empty or undefined tokens
  2. Improved environment variable generation to only include OAuth providers actually selected by the user

## 0.1.1

### Patch Changes

- [`a67e0f4`](https://github.com/withstudiocms/create-studiocms/commit/a67e0f465906360e7996a52e2bf75871731448f4) Thanks [@Adammatthiesen](https://github.com/Adammatthiesen)! - Update readme

## 0.1.0

### Minor Changes

- [#4](https://github.com/withstudiocms/create-studiocms/pull/4) [`b6f2751`](https://github.com/withstudiocms/create-studiocms/commit/b6f27517e2fe1a162a0bb1cba9f1585c66032a56) Thanks [@Adammatthiesen](https://github.com/Adammatthiesen)! - Initial Release
