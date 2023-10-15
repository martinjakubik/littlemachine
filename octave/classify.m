%% Initialization
clear ; close all; clc

data = load('labellist.csv');
X = data(:, [1:16]); y = data(:, 17);

% sets up the parameters

% 4x4 input images
input_layer_size = 16;

% 2 labels, 0 or 1
num_labels = 2;

m = size(X, 1);

% randomly selects 100 data points to display
rand_indices = randperm(m);
selection = X(rand_indices(1:100), :);

% visualizes the dataset
displayData(selection);

fprintf('Program paused. Press enter to continue.\n');
pause;

fprintf('\nTraining One-vs-All Logistic Regression...\n')

lambda = 0.1;
[all_theta] = oneVsAll(X, y, num_labels, lambda);

save("../resources/all_theta.debug.mat", "all_theta");
% disp(all_theta);

fprintf('Program paused. Press enter to continue.\n');
pause;

pred = predictOneVsAll(all_theta, X);

save("../resources/prediction.debug.mat", "pred")
% disp(pred')

fprintf('\nTraining Set Accuracy: %f\n', mean(double(pred == y)) * 100);
