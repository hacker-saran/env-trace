import * as acorn from 'acorn';
import { walk } from 'estree-walker';
import fs from 'fs';

export async function scanFileForEnvs(filePath: string): Promise<string[]> {
  const code = fs.readFileSync(filePath, 'utf-8');
  const foundVars = new Set<string>();

  try {
    const ast = acorn.parse(code, {
      ecmaVersion: 'latest',
      sourceType: 'module',
    }) as any;

    walk(ast, {
      enter(node: any) {
        // 1. Look for process.env.VARIABLE (MemberExpression)
        if (
          node.type === 'MemberExpression' &&
          node.object.type === 'MemberExpression' &&
          node.object.object?.name === 'process' &&
          node.object.property?.name === 'env'
        ) {
          if (node.property.type === 'Identifier') {
            foundVars.add(node.property.name);
          } else if (node.property.type === 'Literal') {
            foundVars.add(node.property.value);
          }
        }

        // 2. Look for const { KEY } = process.env (VariableDeclarator with ObjectPattern)
        if (
          node.type === 'VariableDeclarator' &&
          node.id.type === 'ObjectPattern' &&
          node.init?.type === 'MemberExpression' &&
          node.init.object?.name === 'process' &&
          node.init.property?.name === 'env'
        ) {
          node.id.properties.forEach((prop: any) => {
            if (prop.type === 'Property' && prop.key.type === 'Identifier') {
              foundVars.add(prop.key.name);
            }
          });
        }

        // 3. Look for ({ KEY } = process.env) (AssignmentExpression with ObjectPattern)
        if (
          node.type === 'AssignmentExpression' &&
          node.left.type === 'ObjectPattern' &&
          node.right?.type === 'MemberExpression' &&
          node.right.object?.name === 'process' &&
          node.right.property?.name === 'env'
        ) {
          node.left.properties.forEach((prop: any) => {
            if (prop.type === 'Property' && prop.key.type === 'Identifier') {
              foundVars.add(prop.key.name);
            }
          });
        }
      },
    });
  } catch (e) {
    // Silently skip files that fail to parse (e.g., non-JS files picked up by glob)
  }

  return Array.from(foundVars);
}