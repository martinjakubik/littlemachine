%   J = SIGMOID(z) computes the sigmoid of z.
function g = sigmoid(z)

    % returns
    g = zeros(size(z));

    % computes the sigmoid of each value of z (z can be a matrix, vector or scalar).
    g = 1 ./ (1 + exp(-1 * z));

end
