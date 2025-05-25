# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] - 2025-05-25

### Added

- **Block-Direction Property Optimization**: Significant performance improvement for vertical/block-direction properties
  - Block-only properties (e.g., `margin-block`, `padding-block-start`, `inset-block`) now generate single rules without direction selectors
  - Mixed properties continue to generate separate LTR/RTL rules as needed
  - Reduces CSS output size and eliminates duplicate identical rules
- **Comprehensive Test Coverage**: Expanded test suite from 23 to 48 tests (+109% increase)
  - Added edge case testing for malformed CSS and error handling
  - Complex CSS expression support (calc, clamp, var, min, max)
  - Mixed logical and physical property scenarios
  - Modern CSS syntax validation (custom properties, nested at-rules)
  - Branch coverage improved from 93.9% to 94.25%

### Enhanced

- **Intelligent Property Detection**: Replaced hardcoded property enumeration with rule-based logic
  - More maintainable and extensible property detection algorithm
  - Better handling of edge cases like `inset` vs `inset-block*` properties
  - Improved accuracy for future CSS logical property additions
- **Error Resilience**: Enhanced error handling and graceful degradation
  - Robust handling of malformed CSS input
  - Graceful fallbacks when postcss-logical transformation fails
  - Better support for experimental CSS syntax
- **Code Quality**: Removed unused functions and optimized core logic
  - Cleaner, more maintainable codebase
  - Better type safety and documentation

### Fixed

- **Property Classification**: Fixed edge case handling for `inset` property classification
  - `inset` property correctly treated as mixed-direction (generates LTR/RTL rules)
  - `inset-block*` properties correctly treated as block-only (single rule)

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
