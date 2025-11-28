#include <iostream>
#include <string>
#include "ExpressionTree.h"
using namespace std;

int main() {
    string expr;
    cout << "Enter arithmetic expression: ";
    getline(cin, expr);

    vector<string> tokens = tokenize(expr);
    vector<string> postfix = infixToPostfix(tokens);
    Node* tree = buildAST(postfix);
    double result = evaluate(tree);

    cout << "Result: " << result << endl;

    deleteTree(tree);
    return 0;
}