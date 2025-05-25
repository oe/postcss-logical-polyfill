# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.0] - 2025-05-25

### Added

- **Output Order Configuration**: New `outputOrder` option to control the generation order of LTR and RTL rules
  - `outputOrder: 'ltr-first'` (default) - Outputs LTR rules before RTL rules
  - `outputOrder: 'rtl-first'` - Outputs RTL rules before LTR rules
  - Only affects unscoped logical properties; scoped rules maintain their original order
  - Useful for RTL-primary websites and CSS specificity control
- Comprehensive test suite for output order functionality
- New example demonstrating output order configuration with side-by-side comparisons
- Enhanced documentation with detailed usage examples and use cases

### Enhanced

- README documentation with complete output order configuration guide
- Examples directory with new `output-order` demonstration
- Test coverage expanded to include output order scenarios

## [0.1.0] - 2025-05-24

### Added

- Initial release
- Support for `:dir(rtl)` and `[dir="rtl"]` selectors
- Integration with postcss-logical
- Option to customize RTL and LTR selectors
- TypeScript type definitions
- Comprehensive test suite
