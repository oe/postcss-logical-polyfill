import postcss, { PluginCreator, Root, Rule, AtRule } from 'postcss';
import logical from 'postcss-logical';

interface LogicalScopeOptions {
  rtl?: { selector?: string };
  ltr?: { selector?: string };
}

// 检查是否有逻辑属性
function hasLogicalProperties(rule: Rule): boolean {
  return rule.some(decl => 
    decl.type === 'decl' && (
      decl.prop.includes('inline') || 
      decl.prop.includes('block') ||
      decl.prop.includes('inset')
    )
  );
}

// 检查是否是 RTL 选择器
function isRtlSelector(selector: string): boolean {
  return selector.includes(':dir(rtl)') || selector.includes('[dir="rtl"]') || selector.includes("[dir='rtl']");
}

// 检查是否是 LTR 选择器  
function isLtrSelector(selector: string): boolean {
  return selector.includes(':dir(ltr)') || selector.includes('[dir="ltr"]') || selector.includes("[dir='ltr']");
}

// 清理方向选择器
function cleanDirectionSelectors(selector: string): string {
  return selector
    .replace(/:dir\(rtl\)/g, '')
    .replace(/:dir\(ltr\)/g, '')
    .replace(/\[dir=["']?rtl["']?\]/g, '')
    .replace(/\[dir=["']?ltr["']?\]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// 统一的规则处理函数 - 修复版本
async function processRule(rule: Rule, ltrSelector: string, rtlSelector: string): Promise<Rule[]> {
  const hasLogical = hasLogicalProperties(rule);
  const hasLtr = rule.selectors.some(isLtrSelector);
  const hasRtl = rule.selectors.some(isRtlSelector);
  
  // 如果没有逻辑属性也没有方向选择器，直接返回原规则
  if (!hasLogical && !hasLtr && !hasRtl) {
    return [rule.clone()];
  }
  
  const results: Rule[] = [];
  
  // 处理 LTR 的情况：
  // 1. 有 LTR 选择器的规则
  // 2. 有逻辑属性但没有任何方向选择器的规则
  if (hasLtr || (hasLogical && !hasLtr && !hasRtl)) {
    let selectors = rule.selectors;
    
    if (hasLtr) {
      // 过滤 LTR 选择器并清理
      selectors = rule.selectors.filter(isLtrSelector).map(cleanDirectionSelectors);
    }
    // else: 如果只有逻辑属性，使用原选择器
    
    if (selectors.length > 0) {
      const ltrRule = rule.clone();
      ltrRule.selectors = selectors;
      
      if (hasLogical) {
        // 应用逻辑转换
        const tempRoot = postcss.root();
        tempRoot.append(ltrRule);
        const transformed = await postcss([logical({ inlineDirection: 'left-to-right' as any })])
          .process(tempRoot, { from: undefined });
        
        transformed.root.walkRules(transformedRule => {
          transformedRule.selectors = transformedRule.selectors.map(sel => `${ltrSelector} ${sel}`);
          results.push(transformedRule);
        });
      } else {
        ltrRule.selectors = ltrRule.selectors.map(sel => `${ltrSelector} ${sel}`);
        results.push(ltrRule);
      }
    }
  }
  
  // 处理 RTL 的情况：
  // 1. 有 RTL 选择器的规则
  // 2. 有逻辑属性但没有任何方向选择器的规则
  if (hasRtl || (hasLogical && !hasLtr && !hasRtl)) {
    let selectors = rule.selectors;
    
    if (hasRtl) {
      // 过滤 RTL 选择器并清理
      selectors = rule.selectors.filter(isRtlSelector).map(cleanDirectionSelectors);
    }
    // else: 如果只有逻辑属性，使用原选择器
    
    if (selectors.length > 0) {
      const rtlRule = rule.clone();
      rtlRule.selectors = selectors;
      
      if (hasLogical) {
        // 应用逻辑转换
        const tempRoot = postcss.root();
        tempRoot.append(rtlRule);
        const transformed = await postcss([logical({ inlineDirection: 'right-to-left' as any })])
          .process(tempRoot, { from: undefined });
        
        transformed.root.walkRules(transformedRule => {
          transformedRule.selectors = transformedRule.selectors.map(sel => `${rtlSelector} ${sel}`);
          results.push(transformedRule);
        });
      } else {
        rtlRule.selectors = rtlRule.selectors.map(sel => `${rtlSelector} ${sel}`);
        results.push(rtlRule);
      }
    }
  }
  
  return results;
}

const logicalScope: PluginCreator<LogicalScopeOptions> = (opts = {}) => {
  const rtlSelector = opts.rtl?.selector || '[dir="rtl"]';
  const ltrSelector = opts.ltr?.selector || '[dir="ltr"]';

  return {
    postcssPlugin: 'postcss-logical-scope',
    
    async Once(root) {
      // 收集所有需要处理的规则（包括嵌套在 at-rule 中的）
      const rulesToProcess: { rule: Rule; parent: Root | AtRule }[] = [];
      
      // 使用 walkRules 遍历所有规则，无论嵌套层级
      root.walkRules(rule => {
        const hasLogical = hasLogicalProperties(rule);
        const hasLtr = rule.selectors.some(isLtrSelector);
        const hasRtl = rule.selectors.some(isRtlSelector);
        
        if (hasLogical || hasLtr || hasRtl) {
          rulesToProcess.push({ rule, parent: rule.parent as Root | AtRule });
        }
      });
      
      // 处理所有规则
      for (const { rule, parent } of rulesToProcess) {
        const processedRules = await processRule(rule, ltrSelector, rtlSelector);
        
        // 替换原规则
        rule.remove();
        
        // 插入新规则
        processedRules.forEach(newRule => {
          parent.append(newRule);
        });
      }
      
      // 改进的规则合并 - 正确处理属性覆盖
      const ruleMap = new Map<string, Rule>();
      root.walkRules(rule => {
        const key = rule.selector;
        const existing = ruleMap.get(key);
        
        if (existing) {
          // 合并声明，后面的属性覆盖前面的
          rule.each(decl => {
            if (decl.type === 'decl') {
              // 检查是否已存在相同属性
              let found = false;
              existing.each(existingDecl => {
                if (existingDecl.type === 'decl' && existingDecl.prop === decl.prop) {
                  // 覆盖现有值
                  existingDecl.value = decl.value;
                  found = true;
                  return false; // 停止遍历
                }
              });
              
              // 如果没有找到相同属性，添加新的
              if (!found) {
                existing.append(decl.clone());
              }
            }
          });
          rule.remove();
        } else {
          ruleMap.set(key, rule);
        }
      });
    }
  };
};

logicalScope.postcss = true;
export default logicalScope;
