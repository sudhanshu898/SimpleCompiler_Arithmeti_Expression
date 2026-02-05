#include <iostream>
#include <string>
#include "ExpressionTree.h"
using namespace std;

int main() {
    string expr;
    cout << "SimpleCompiler console UI. Type ':q' to quit." << endl;
    while (true) {
        cout << "\nEnter arithmetic expression (or :q to quit): ";
        if (!getline(cin, expr)) break;
        if (expr == ":q" || expr == ":quit") break;
        if (expr.empty()) continue;

        vector<string> tokens = tokenize(expr);
        vector<string> postfix = infixToPostfix(tokens);
        Node* tree = buildAST(postfix);

        cout << "Tokens: ";
        for (const auto& t : tokens) cout << t << ' ';
        cout << endl;

        cout << "Postfix: ";
        for (const auto& p : postfix) cout << p << ' ';
        cout << endl;

        double result = evaluate(tree);
        cout << "Result: " << result << endl;

        cout << "AST:\n";
        printTree(tree);

        deleteTree(tree);
    }
    cout << "Goodbye." << endl;
    return 0;
}