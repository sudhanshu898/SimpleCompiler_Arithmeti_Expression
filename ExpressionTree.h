#ifndef EXPRESSION_TREE_H
#define EXPRESSION_TREE_H

#include <string>
#include <vector>
using namespace std;

struct Node {
    string value;
    Node* left;
    Node* right;
    Node(string val) : value(val), left(nullptr), right(nullptr) {}
};

// Tokenization and parsing functions
vector<string> tokenize(const string& expr);
vector<string> infixToPostfix(const vector<string>& tokens);

// AST functions
Node* buildAST(const vector<string>& postfix);
double evaluate(Node* root);
void deleteTree(Node* root);

#endif