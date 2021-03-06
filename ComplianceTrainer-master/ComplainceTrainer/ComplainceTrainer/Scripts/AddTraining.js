﻿var quizId = 0;

//This displays the datepicker
$('#sandbox-container input').datepicker({
    autoclose: true
});

$('#sandbox-container input').on('show', function (e) {

    if (e.date) {
        $(this).data('stickyDate', e.date);
    }
    else {
        $(this).data('stickyDate', null);
    }
});

$('#sandbox-container input').on('hide', function (e) {
    var stickyDate = $(this).data('stickyDate');

    if (!e.date && stickyDate) {
        console.debug('restore stickyDate', stickyDate);
        $(this).datepicker('setDate', stickyDate);
        $(this).data('stickyDate', null);
    }
});


// This lets the HR member look for media files when "Browse" is clicked.
$(document).on('click', '.browse', function () {
    var file = $(this).parent().parent().parent().find('.hide-file');
    file.trigger('click');
});
$(document).on('change', '.hide-file', function () {
    $(this).parent().find('.form-control').val($(this).val().replace(/C:\\fakepath\\/i, ''));
});

var app = angular.module('addQuizApp', ['ngRoute']);

app.controller('addQuestionController', function ($scope, $http, $compile) {

    $scope.questionData = {}
    $scope.status = {
        isEditing: false
    }
    $scope.mcAnswers = [
        answer1 = {
            answerText: '',
            isCorrect: false
        },
        answer2 = {
            answerText: '',
            isCorrect: false
        },
        answer3 = {
            answerText: '',
            isCorrect: false
        },
        answer4 = {
            answerText: '',
            isCorrect: false
        }
    ];

    $scope.tfAnswers = [
        answer1 = {
            answerText: 'True',
            isCorrect: false
        },
        answer2 = {
            answerText: 'False',
            isCorrect: false
        }
    ]

    var sentJson = {
        questionText: '',
        questionType: '',
        answers: [],
        answerIds: []
    };

    $scope.isCorrect = '';

    $scope.setCorrectAnswer = function () {
        sentJson.questionText = $scope.questionData.questionText;
        sentJson.questionType = $scope.questionData.questionType;
        if ($scope.questionData.questionType == 'multipleChoice') {

            if ($scope.isCorrect == 'answer1') {
                $scope.mcAnswers[0].isCorrect = true;
            }
            else if ($scope.isCorrect == 'answer2') {
                $scope.mcAnswers[1].isCorrect = true;
            }
            else if ($scope.isCorrect == 'answer3') {
                $scope.mcAnswers[2].isCorrect = true;
            }
            else {
                $scope.mcAnswers[3].isCorrect = true;
            }
            sentJson.answers = $scope.mcAnswers;
        }
        else if ($scope.questionData.questionType == 'trueFalse') {
            if ($scope.isCorrect == 'answer1') {
                $scope.tfAnswers[0].isCorrect = true;
            }
            else if ($scope.isCorrect == 'answer2') {
                $scope.tfAnswers[1].isCorrect = true;
            }
            sentJson.answers = $scope.tfAnswers;
        }
        if ($scope.status.isEditing) {
            $scope.updateQuestion();
        }
        else {
            $scope.addQuestion();
        }
    }

    var config = {
        headers: {
            'Content-Type': 'application/json;'
        }
    }

    $scope.cancelQuestion = function () {
        $scope.status.isEditing = false;
        $scope.clearQuestion();
    }

    $scope.clearQuestion = function () {
        $scope.questionData.questionType = '';
        $scope.questionData.questionText = '';
        $scope.isCorrect = 'answer1';
        $scope.mcAnswers[0].answerText = '';
        $scope.mcAnswers[1].answerText = '';
        $scope.mcAnswers[2].answerText = '';
        $scope.mcAnswers[3].answerText = '';
    }
    var tempVars = {
        ids: [],
        rowIndex: 0
    }
    $("body").on("click", ".edit", function () {
        var table = $('#questionTable').DataTable();
        tempVars.ids = JSON.parse(table.row($(this).parent()).data()[0])
        tempVars.rowIndex = table.row($(this).parent()).index();
        sentJson.answerIds = tempVars.ids;
        $http.post('/Training/GetQuestionAnswers', JSON.stringify({ questionId: sentJson.answerIds[0] }), config).then(function (res) {
            $scope.status.isEditing = true;
            $scope.questionData.questionId = res.data.id;
            $scope.questionData.questionType = res.data.questionType;
            $scope.questionData.questionText = res.data.questionText;
            if (res.data.questionType == 'multipleChoice') {
                $scope.mcAnswers[0].answerText = res.data.answers[0].answerText;
                $scope.mcAnswers[1].answerText = res.data.answers[1].answerText;
                $scope.mcAnswers[2].answerText = res.data.answers[2].answerText;
                $scope.mcAnswers[3].answerText = res.data.answers[3].answerText;
                $.each(res.data.answers, function (index, value) {
                    if (value.isCorrect == true) {
                        $scope.isCorrect = 'answer' + (index + 1);
                    }
                });
            }
            else if (res.data.questionType == 'trueFalse') {
                $.each(res.data.answers, function (index, value) {
                    if (value.isCorrect == true) {
                        $scope.isCorrect = 'answer' + (index + 1);
                    }
                });
            }
        })
    });

    $scope.addQuestion = function () {
        $("#questionModal").modal('hide');
        $http.post('/Training/AddQuizQuestionAnswers', { title: document.getElementById("trainingTitle").value, questionData: JSON.stringify(sentJson) }, config).then(function (res) {
            var row = [JSON.stringify(res.data), angular.copy($scope.questionData.questionType), $scope.questionData.questionText, "<button data-toggle='modal' data-target='#questionModal' class='btn btn-default edit'>Edit</button>", "<button class='btn btn-default remove'>remove</button>"];
            var table = $('#questionTable').DataTable();
            table.row.add(row).draw();
            var angularElement = angular.element($('#questionTable'));
            $compile(angularElement.contents())($scope);
            $scope.clearQuestion();
        });
    }

    $scope.updateQuestion = function () {
        $("#questionModal").modal('hide');
        $http.post('/Training/UpdateQuizQuestionAnswers', JSON.stringify({questionIds: tempVars.ids, questionData: sentJson }), config).then(function (res) {
            var table = $('#questionTable').DataTable();
            table.rows().every(function (rowIdx, tableLoop, rowLoop) {
                if (rowIdx == tempVars.rowIndex) {
                    var data = this.data();
                    data[1] = sentJson.questionType;
                    data[2] = sentJson.questionText;
                    this.data(data);
                }
            });
            $scope.clearQuestion();
        });
    }
    $('#questionModal').on('hidden.bs.modal', function () {
        $scope.status.isEditing = false;
    });
});

app.controller('addQuizController', function ($scope, $http, $timeout) {
    $scope.savedForm;
    $scope.name = "quiz"
    $scope.groups = [];
    $scope.inactive = true;
    $scope.quizData = {}

    function enableAddQuestion() {
       $scope.inactive = false;
    }

    function disableAddQuestion() {
        $scope.inactive = true;
    }

    $scope.setGroups = function () {      
        
    }

    $('.quizFormInfo').on('change keyup paste', function () {
        var saved = '';
        var current = '';
        $timeout(function () {
            saved = JSON.stringify($scope.savedForm);
            current = JSON.stringify($scope.quizData);
            if (quizId !== 0 && saved != current) {
                $scope.$apply(function () {
                    $scope.inactive = true;
                });
            }
            else if (quizId !== 0 && saved == current) {
                $scope.$apply(function () {
                    $scope.inactive = false;
                });
            }
        }, 0);
    });


    $http.get('/Training/GetAllGroups').then(function (data) {
        $.each(data.data, function (index, value) {
            $scope.groups.push(value);
        });
    });

    var config = {
        headers: {
            'Content-Type': 'application/json;'
        }
    }

    $scope.addQuiz = function () {
        $scope.savedForm = angular.copy($scope.quizData);
        enableAddQuestion();
        $("#confirm-submit").modal('hide');
        $('#trainingTitle').attr('disabled', 'disabled');
        if (quizId != 0) {
            $http.post('/Training/UpdateQuiz', { quizData: JSON.stringify($scope.quizData) }, config).then(function (res) {
                quizId = res.data[0];
            });
        }
        else {
            $http.post('/Training/AddQuiz', { quizData: JSON.stringify($scope.quizData) }, config).then(function (res) {
                quizId = res.data[0];
            });
        }
    };

    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1;
    var yyyy = today.getFullYear();
    if (dd < 10) {
        dd = '0' + dd
    }
    if (mm < 10) {
        mm = '0' + mm
    }
    today = mm + '/' + dd + '/' + yyyy;
    var todayInt = Date.parse(today);

    $('.dateInfo').on('change keyup', function () {
        var startDate = Date.parse($("#startDate").val());
        var preferredDate = Date.parse($("#preferredDate").val());
        var expirationDate = Date.parse($("#expirationDate").val());
        startDateCheck(startDate);
        preferredDateCheck(preferredDate, startDate);
        expirationDateCheck(expirationDate, preferredDate);
    });


    function startDateCheck(startDate) {
        if (Number.isInteger(startDate) && startDate < todayInt) {
            document.getElementById('startWarning').innerHTML = "Start date must be on or after today's date"
            $("#startDate").val("");
        }
        else if (Number.isInteger(startDate)) {
            document.getElementById('startWarning').innerHTML = ""
        }
    }

    function preferredDateCheck(preferredDate, startDate) {
        if (!Number.isInteger(startDate)) {
            $("#preferredDate").val("");
        }
        if (Number.isInteger(preferredDate) && preferredDate < startDate && Number.isInteger(startDate)) {
            document.getElementById('preferredWarning').innerHTML = "Preferred date must be after start date"
            $("#preferredDate").val("");
        }
        else if (Number.isInteger(preferredDate)) {
            document.getElementById('preferredWarning').innerHTML = ""
        }
    }

    function expirationDateCheck(expirationDate, preferredDate) {
        if (!Number.isInteger(preferredDate)) {
            $("#expirationDate").val("");
        }
        if (Number.isInteger(expirationDate) && expirationDate < preferredDate && Number.isInteger(preferredDate)) {
            document.getElementById('expirationWarning').innerHTML = "Expiration date must be after preferred date"
            $("#expirationDate").val("");
        }
        else if (Number.isInteger(expirationDate)) {
            document.getElementById('expirationWarning').innerHTML = ""
        }
    }
});

$(document).ready(function () {
    var userData = {}
    $('#questionTable').DataTable({
        data: userData,
        columns:
        [
            { title: "id", visible: false },
            { title: "Question Type" },
            { title: "Question Text" },
            { title: "" },
            { title: "" }
        ]
    });
    var questionIds;
    var row;

    $("body").on("click", ".remove", function () {
        var table = $('#questionTable').DataTable();
        questionIds = JSON.parse(table.row($(this).parent()).data()[0]);
        row = $(this).parent();
        $("#confirmQuestionRemove").modal('show');
    });

    $('#removeQuestionBtn').on('click', function () {
        $.ajax({
            method: 'post',
            url: '/Training/RemoveQuestion',
            dataType: "json",
            contentType: 'application/json',
            data: JSON.stringify({ ids: questionIds }),
            success: function (res, status) {
                if (res == true) {
                    $("#responseMessage").removeClass("text-danger")
                    $("#responseMessage").addClass('text-success').html("Successfully Deleted Question").show().delay(5000).fadeOut();
                    removeQuestionFromTable();
                }
                else {
                    $("#responseMessage").removeClass("text-success")
                    $("#responseMessage").addClass('text-danger').html("There was an error deleting the question").show().delay(5000).fadeOut();
                }
            }
        }).then(function (response) {
            $("#confirmQuestionRemove").modal('hide');
        });
    });

    function removeQuestionFromTable() {
        $('#questionTable').DataTable().row(row).remove().draw();
    }
});