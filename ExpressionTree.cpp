#include "ExpressionTree.h"
#include <stack>
#include <cctype>
#include <sstream>
#include <map>
#include <cmath>
using namespace std;

bool isOperator(const string& s) {
    return s == "+" || s == "-" || s == "*" || s == "/";
}



int precedence(const string& op) {
    if (op == "+" || op == "-") return 1;
    if (op == "*" || op == "/") return 2;
    return 0;
}

vector<string> tokenize(const string& expr) {
    vector<string> tokens;
    string num = "";
    for (char ch : expr) {
        if (isdigit(ch) || ch == '.') {
            num += ch;
        } else {
            if (!num.empty()) {
                tokens.push_back(num);
                num = "";
            }
            if (ch == ' ') continue;
            if (ch == '+' || ch == '-' || ch == '*' || ch == '/' || ch == '(' || ch == ')') {
                tokens.push_back(string(1, ch));
            }
        }
    }
    if (!num.empty()) tokens.push_back(num);
    return tokens;
}

vector<string> infixToPostfix(const vector<string>& tokens) {
    vector<string> output;
    stack<string> ops;

    for (const string& token : tokens) {
        if (isdigit(token[0]) || (token.size() > 1 && token[0] == '-' && isdigit(token[1]))) {
            output.push_back(token);
        } else if (token == "(") {
            ops.push(token);
        } else if (token == ")") {
            while (!ops.empty() && ops.top() != "(") {
                output.push_back(ops.top());
                ops.pop();
            }
            if (!ops.empty()) ops.pop(); // pop "("
        } else if (isOperator(token)) {
            while (!ops.empty() && precedence(ops.top()) >= precedence(token)) {
                output.push_back(ops.top());
                ops.pop();
            }
            ops.push(token);
        }
    }

    while (!ops.empty()) {
        output.push_back(ops.top());
        ops.pop();
    }

    return output;
}

Node* buildAST(const vector<string>& postfix) {
    stack<Node*> st;
    for (const string& token : postfix) {
        if (isOperator(token)) {
            Node* right = st.top(); st.pop();
            Node* left = st.top(); st.pop();
            Node* newNode = new Node(token);
            newNode->left = left;
            newNode->right = right;
            st.push(newNode);
        } else {
            st.push(new Node(token));
        }
    }
    return st.top();
}

double evaluate(Node* root) {
    if (!isOperator(root->value)) return stod(root->value);

    double leftVal = evaluate(root->left);
    double rightVal = evaluate(root->right);

    if (root->value == "+") return leftVal + rightVal;
    if (root->value == "-") return leftVal - rightVal;
    if (root->value == "*") return leftVal * rightVal;
    if (root->value == "/") return leftVal / rightVal;

    return 0;
}

void deleteTree(Node* root) {
    if (!root) return;
    deleteTree(root->left);
    deleteTree(root->right);
    delete root;
}