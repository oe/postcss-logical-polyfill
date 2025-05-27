# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.0] - 2025-05-27

### Added

- **Logical Properties Shim System**: Major feature extension adding support for previously unsupported CSS logical properties and values
  - New `logical-shim.ts` module with extensible architecture
  - `SHIM_DECLARATIONS` object mapping logical properties to transformation functions
  - `extendProcessors()` function for seamless integration with existing postcss-logical functionality
  - Minimal-impact approach that extends rather than replaces core functionality

- **Scroll Properties Support**: Full support for CSS scroll-related logical properties
  - `scroll-margin-inline-start/end` with direction-aware transformation to `left`/`right`
  - `scroll-margin-block-start/end` transformation to `top`/`bottom`
  - `scroll-padding-inline-start/end` with direction-aware transformation to `left`/`right`
  - `scroll-padding-block-start/end` transformation to `top`/`bottom`
  - Shorthand support: `scroll-margin-inline`, `scroll-margin-block`, `scroll-padding-inline`, `scroll-padding-block`
  - Proper value parsing for multi-value shorthands (start/end value handling)

- **Logical Values Support**: Support for logical values in existing CSS properties
  - `float: inline-start/end` → direction-aware `left`/`right` transformation
  - `clear: inline-start/end` → direction-aware `left`/`right` transformation  
  - `resize: block/inline` → `vertical`/`horizontal` transformation
  - Preserves non-logical values unchanged

- **Smart Selector Priority Optimization**: **NEW!** Advanced rightmost priority logic for predictable CSS behavior
  - Implements rightmost priority algorithm that prioritizes the most specific (rightmost) direction selector in complex selector chains
  - Handles mixed built-in (`:dir()`, `[dir]`) and custom direction selectors seamlessly
  - Eliminates unexpected behavior from contradictory direction contexts
  - Follows CSS cascade principles for intuitive results
  - Framework-agnostic support for any custom selector pattern
  - Comprehensive test coverage for edge cases and complex nested scenarios
  - New example demonstrating the optimization with real-world selector chains

- **Enhanced Documentation**: Comprehensive documentation improvements
  - New technical documentation (`SELECTOR-PRIORITY-OPTIMIZATION.md`) explaining the rightmost priority logic
  - Updated README with detailed explanations and examples of the new optimization
  - Added selector priority optimization example in `examples/selector-priority/`
  - Bilingual documentation (English/Chinese) for broader accessibility

### Enhanced

- **Property Detection**: Extended logical property detection to include shim-supported properties
  - Updated `supportedLogicalPropertiesSet` with all shim-enabled properties
  - Improved accuracy for property classification and transformation decisions
  - Better integration between core logical properties and shim extensions

- **Test Coverage**: Comprehensive test suite expansion to 250 tests (100% pass rate)
  - Added unit tests for all shim functionality in `logical-properties-unit.test.ts`
  - Integration tests for combined shim and core features
  - Enhanced `limitations-handling.test.ts` with shim capability demonstrations
  - Exception handling and edge case coverage
  - CSS variables interaction testing with logical property names

- **Output Optimization**: Intelligent rule consolidation for better CSS output
  - Direction-independent properties consolidated in main rules
  - Direction-dependent properties separated into `[dir="ltr"]`/`[dir="rtl"]` variants only when needed
  - Reduced CSS output size through smart property grouping
  - Better performance with fewer duplicate declarations

### Fixed

- **Test Expectations**: Corrected test expectations to match actual optimized behavior
  - Updated 5 failing tests in `limitations-handling.test.ts`
  - Fixed property ordering expectations to match consolidated output
  - Aligned test expectations with actual (correct) shim system behavior
  - Resolved discrepancies between expected and actual CSS transformation results

### Technical

- **Architecture**: Clean separation of concerns between core and extended functionality
  - Shim system designed to be non-intrusive and easily extensible
  - Follows existing postcss-logical patterns and conventions
  - Modular approach allowing future extensions without core changes
  - Type-safe implementation with full TypeScript support

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
