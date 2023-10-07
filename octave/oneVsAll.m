% trains multiple logistic regression classifiers and returns all
% the classifiers in a matrix all_theta, where the i-th row of all_theta 
% corresponds to the classifier for label i
function [all_theta] = oneVsAll(X, y, num_labels, lambda)

    % some useful variables
    m = size(X, 1);
    n = size(X, 2);

    % returns
    all_theta = zeros(num_labels, n + 1);

    % add ones to the X data matrix
    X = [ones(m, 1) X];

    % trains num_labels logistic regression classifiers with regularization
    % parameter lambda. 
    initial_theta = zeros(n + 1, 1);

    options = optimset('GradObj', 'on', 'MaxIter', 50);

    for c = 1:num_labels
        all_theta(c, :) = ...
            fmincg (@(debugParams, t)(lrCostFunction(debugParams, t, X, (y == c), lambda)), ...
                initial_theta, options);
    end;

end
