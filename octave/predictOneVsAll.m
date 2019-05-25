% predicts the label for a trained one-vs-all classifier. The labels 
% are in the range 1..K, where K = size(all_theta, 1). 
function p = predictOneVsAll(all_theta, X)

    m = size(X, 1);
    num_labels = size(all_theta, 1);

    % returns
    p = zeros(size(X, 1), 1);

    % adds ones to the X data matrix
    X = [ones(m, 1) X];

    A = zeros(size(all_theta, 1), size(X, 1));
    A = sigmoid(all_theta * X');

    [x p] = max(A);
    p = p';

end
