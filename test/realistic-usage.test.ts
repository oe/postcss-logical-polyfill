import { describe, test } from 'vitest';
import { runTestCase, TestCase } from './test-utils';

describe('Realistic Usage Scenarios', () => {
  
  describe('Component Styling Patterns', () => {
    const componentTests: TestCase[] = [
      {
        name: 'Button component with mixed properties',
        input: `
          .btn {
            display: inline-block;
            padding-block: 0.75rem;
            padding-inline: 1.5rem;
            margin-inline-end: 0.5rem;
            border: 1px solid transparent;
            border-radius: 0.375rem;
            background-color: #007bff;
            color: white;
            text-decoration: none;
            cursor: pointer;
          }
          
          .btn:hover {
            background-color: #0056b3;
            transform: translateY(-1px);
          }
          
          .btn--large {
            padding-block: 1rem;
            padding-inline: 2rem;
            font-size: 1.125rem;
          }
        `,
        expected: `
          .btn {
            display: inline-block;
            padding-top: 0.75rem;
            padding-bottom: 0.75rem;
            padding-left: 1.5rem;
            padding-right: 1.5rem;
            border: 1px solid transparent;
            border-radius: 0.375rem;
            background-color: #007bff;
            color: white;
            text-decoration: none;
            cursor: pointer;
          }

          [dir="ltr"] .btn {
            margin-right: 0.5rem;
          }

          [dir="rtl"] .btn {
            margin-left: 0.5rem;
          }
          
          .btn:hover {
            background-color: #0056b3;
            transform: translateY(-1px);
          }
          
          .btn--large {
            padding-top: 1rem;
            padding-bottom: 1rem;
            padding-left: 2rem;
            padding-right: 2rem;
            font-size: 1.125rem;
          }
        `
      },
      {
        name: 'Card component layout',
        input: `
          .card {
            display: block;
            margin-block-end: 1.5rem;
            padding: 1rem;
            border: 1px solid #e5e7eb;
            border-radius: 0.5rem;
            background-color: white;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }
          
          .card__header {
            margin-block-end: 1rem;
            padding-block-end: 1rem;
            border-block-end: 1px solid #e5e7eb;
          }
          
          .card__title {
            margin: 0;
            margin-block-end: 0.5rem;
            font-size: 1.25rem;
            font-weight: 600;
          }
          
          .card__body {
            line-height: 1.6;
          }
          
          .card__footer {
            margin-block-start: 1rem;
            padding-block-start: 1rem;
            border-block-start: 1px solid #e5e7eb;
            text-align: center;
          }
        `,
        expected: `
          .card {
            display: block;
            margin-bottom: 1.5rem;
            padding: 1rem;
            border: 1px solid #e5e7eb;
            border-radius: 0.5rem;
            background-color: white;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          }
          
          .card__header {
            margin-bottom: 1rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid #e5e7eb;
          }
          
          .card__title {
            margin: 0;
            margin-bottom: 0.5rem;
            font-size: 1.25rem;
            font-weight: 600;
          }
          
          .card__body {
            line-height: 1.6;
          }
          
          .card__footer {
            margin-top: 1rem;
            padding-top: 1rem;
            border-top: 1px solid #e5e7eb;
            text-align: center;
          }
        `
      },
      {
        name: 'Navigation menu with directional awareness',
        input: `
          .nav {
            display: flex;
            align-items: center;
            padding-block: 1rem;
            padding-inline: 2rem;
            background-color: #f8f9fa;
            border-block-end: 1px solid #dee2e6;
          }
          
          .nav__brand {
            margin-inline-end: auto;
            font-size: 1.25rem;
            font-weight: bold;
            text-decoration: none;
            color: #343a40;
          }
          
          .nav__menu {
            display: flex;
            list-style: none;
            margin: 0;
            padding: 0;
          }
          
          .nav__item {
            margin-inline-start: 1rem;
          }
          
          .nav__link {
            display: block;
            padding-block: 0.5rem;
            padding-inline: 1rem;
            text-decoration: none;
            color: #6c757d;
            border-radius: 0.25rem;
            transition: all 0.2s ease;
          }
          
          [dir="rtl"] .nav__brand {
            margin-inline-start: auto;
            margin-inline-end: 0;
          }
        `,
        expected: `
          .nav {
            display: flex;
            align-items: center;
            padding-top: 1rem;
            padding-bottom: 1rem;
            padding-left: 2rem;
            padding-right: 2rem;
            background-color: #f8f9fa;
            border-bottom: 1px solid #dee2e6;
          }

          .nav__brand {
            font-size: 1.25rem;
            font-weight: bold;
            text-decoration: none;
            color: #343a40;
          }
          
          [dir="ltr"] .nav__brand {
            margin-right: auto;
          }

          [dir="rtl"] .nav__brand {
            margin-left: auto;
          }

          .nav__menu {
            display: flex;
            list-style: none;
            margin: 0;
            padding: 0;
          }
          
          
          [dir="ltr"] .nav__item {
            margin-left: 1rem;
          }
          
          [dir="rtl"] .nav__item {
            margin-right: 1rem;
          }
          
          .nav__link {
            display: block;
            padding-top: 0.5rem;
            padding-bottom: 0.5rem;
            padding-left: 1rem;
            padding-right: 1rem;
            text-decoration: none;
            color: #6c757d;
            border-radius: 0.25rem;
            transition: all 0.2s ease;
          }
          
          [dir="rtl"] .nav__brand {
            margin-right: auto;
            margin-left: 0;
          }
        `
      }
    ];

    test.each(componentTests)('$name', runTestCase);
  });

  describe('Layout Patterns', () => {
    const layoutTests: TestCase[] = [
      {
        name: 'Grid layout with logical spacing',
        input: `
          .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1.5rem;
            padding-inline: 1rem;
            margin-block: 2rem;
          }
          
          .grid__item {
            padding: 1.5rem;
            border: 1px solid #e5e7eb;
            border-radius: 0.5rem;
          }
          
          @media (min-width: 768px) {
            .grid {
              padding-inline: 2rem;
              margin-block: 3rem;
            }
          }
        `,
        expected: `
          .grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1.5rem;
            padding-left: 1rem;
            padding-right: 1rem;
            margin-top: 2rem;
            margin-bottom: 2rem;
          }
          
          .grid__item {
            padding: 1.5rem;
            border: 1px solid #e5e7eb;
            border-radius: 0.5rem;
          }
          
          @media (min-width: 768px) {
            .grid {
              padding-left: 2rem;
              padding-right: 2rem;
              margin-top: 3rem;
              margin-bottom: 3rem;
            }
          }
        `
      },
      {
        name: 'Sidebar layout with mixed properties',
        input: `
          .layout {
            display: flex;
            min-block-size: 100vh;
          }
          
          .sidebar {
            inline-size: 250px;
            min-inline-size: 200px;
            max-inline-size: 300px;
            padding-inline: 1rem;
            padding-block: 2rem;
            background-color: #f8f9fa;
            border-inline-end: 1px solid #dee2e6;
          }
          
          .main-content {
            flex: 1;
            padding: 2rem;
            overflow-x: auto;
          }
          
          .sidebar__nav {
            margin-block-start: 1rem;
          }
          
          .sidebar__link {
            display: block;
            padding-block: 0.5rem;
            padding-inline: 1rem;
            margin-block-end: 0.25rem;
            text-decoration: none;
            color: #495057;
            border-radius: 0.25rem;
          }
        `,
        expected: `
          .layout {
            display: flex;
            min-height: 100vh;
          }

          .sidebar {
            width: 250px;
            min-width: 200px;
            max-width: 300px;
            padding-left: 1rem;
            padding-right: 1rem;
            padding-top: 2rem;
            padding-bottom: 2rem;
            background-color: #f8f9fa;
          }

          [dir="ltr"] .sidebar {
            border-right: 1px solid #dee2e6;
          }

          [dir="rtl"] .sidebar {
            border-left: 1px solid #dee2e6;
          }
          
          .main-content {
            flex: 1;
            padding: 2rem;
            overflow-x: auto;
          }
          
          .sidebar__nav {
            margin-top: 1rem;
          }
          
          .sidebar__link {
            display: block;
            padding-top: 0.5rem;
            padding-bottom: 0.5rem;
            padding-left: 1rem;
            padding-right: 1rem;
            margin-bottom: 0.25rem;
            text-decoration: none;
            color: #495057;
            border-radius: 0.25rem;
          }
        `
      }
    ];

    test.each(layoutTests)('$name', runTestCase);
  });

  describe('Form Styling', () => {
    const formTests: TestCase[] = [
      {
        name: 'Form elements with logical properties',
        input: `
          .form-group {
            margin-block-end: 1.5rem;
          }
          
          .form-label {
            display: block;
            margin-block-end: 0.5rem;
            font-weight: 500;
            color: #374151;
          }
          
          .form-input {
            display: block;
            inline-size: 100%;
            padding-block: 0.75rem;
            padding-inline: 1rem;
            border: 1px solid #d1d5db;
            border-radius: 0.375rem;
            background-color: white;
            transition: border-color 0.15s ease;
          }
          
          .form-input:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }
          
          .form-help {
            margin-block-start: 0.25rem;
            font-size: 0.875rem;
            color: #6b7280;
          }
          
          .checkbox-group {
            display: flex;
            align-items: center;
          }
          
          .checkbox-input {
            margin-inline-end: 0.5rem;
          }
        `,
        expected: `
          .form-group {
            margin-bottom: 1.5rem;
          }
          
          .form-label {
            display: block;
            margin-bottom: 0.5rem;
            font-weight: 500;
            color: #374151;
          }
          
          .form-input {
            display: block;
            width: 100%;
            padding-top: 0.75rem;
            padding-bottom: 0.75rem;
            padding-left: 1rem;
            padding-right: 1rem;
            border: 1px solid #d1d5db;
            border-radius: 0.375rem;
            background-color: white;
            transition: border-color 0.15s ease;
          }
          
          .form-input:focus {
            outline: none;
            border-color: #3b82f6;
            box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          }
          
          .form-help {
            margin-top: 0.25rem;
            font-size: 0.875rem;
            color: #6b7280;
          }
          
          .checkbox-group {
            display: flex;
            align-items: center;
          }
          
          [dir="ltr"] .checkbox-input {
            margin-right: 0.5rem;
          }
          
          [dir="rtl"] .checkbox-input {
            margin-left: 0.5rem;
          }
        `
      }
    ];

    test.each(formTests)('$name', runTestCase);
  });

  describe('Typography and Text Styling', () => {
    const typographyTests: TestCase[] = [
      {
        name: 'Typography with logical spacing',
        input: `
          .prose {
            max-inline-size: 65ch;
            margin-inline: auto;
            padding-inline: 1rem;
            line-height: 1.7;
          }
          
          .prose h1,
          .prose h2,
          .prose h3 {
            margin-block: 1.5rem 1rem;
            line-height: 1.2;
          }
          
          .prose p {
            margin-block-end: 1rem;
          }
          
          .prose blockquote {
            margin-block: 1.5rem;
            margin-inline-start: 0;
            padding-inline-start: 1.5rem;
            border-inline-start: 4px solid #e5e7eb;
            font-style: italic;
          }
          
          .prose ul,
          .prose ol {
            margin-block: 1rem;
            padding-inline-start: 1.5rem;
          }
          
          .prose li {
            margin-block-end: 0.5rem;
          }
        `,
        expected: `
          .prose {
            max-width: 65ch;
            margin-left: auto;
            margin-right: auto;
            padding-left: 1rem;
            padding-right: 1rem;
            line-height: 1.7;
          }
          
          .prose h1,
          .prose h2,
          .prose h3 {
            margin-top: 1.5rem;
            margin-bottom: 1rem;
            line-height: 1.2;
          }
          
          .prose p {
            margin-bottom: 1rem;
          }

          .prose blockquote {
            margin-top: 1.5rem;
            margin-bottom: 1.5rem;
            font-style: italic;
          }
          
          [dir="ltr"] .prose blockquote {
            margin-left: 0;
            padding-left: 1.5rem;
            border-left: 4px solid #e5e7eb;
          }
          
          [dir="rtl"] .prose blockquote {
            margin-right: 0;
            padding-right: 1.5rem;
            border-right: 4px solid #e5e7eb;
          }
          .prose ul,
          .prose ol {
            margin-top: 1rem;
            margin-bottom: 1rem;
          }
          
          [dir="ltr"] .prose ul,
          [dir="ltr"] .prose ol {
            padding-left: 1.5rem;
          }
          
          [dir="rtl"] .prose ul,
          [dir="rtl"] .prose ol {
            padding-right: 1.5rem;
          }
          
          .prose li {
            margin-bottom: 0.5rem;
          }
        `
      }
    ];

    test.each(typographyTests)('$name', runTestCase);
  });
});
