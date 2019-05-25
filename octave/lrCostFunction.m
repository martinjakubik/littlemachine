% computes cost and gradient for logistic regression with 
%regularization
%   J = lrCostFunction(theta, X, y, lambda) computes the cost of using
%   theta as the parameter for regularized logistic regression and the
%   gradient of the cost w.r.t. to the parameters. 
function [J, grad] = lrCostFunction(theta, X, y, lambda)

    % initializes number of training examples
    m = length(y);

    % returns
    J = 0;
    grad = zeros(size(theta));

    % computes the cost of a particular choice of theta.
    % computes the partial derivatives and set grad to the partial derivatives
    % of the cost w.r.t. each parameter in theta

    % calculates cost
    sigmoids = sigmoid(X * theta);

    sumall = (-y' * log(sigmoids) - (1 - y)' * log(1 - sigmoids));

    sumsquares = sum(theta(2:end) .^ 2);

    regularized = lambda * sumsquares / (2 * m);

    J = sumall / m + regularized;

    % calculates gradient
    grad = (X' * (sigmoids .- y)) / m;

    temp = theta;

    temp(1) = 0;

    grad = grad .+ lambda * temp / m;

    grad = grad(:);

end
