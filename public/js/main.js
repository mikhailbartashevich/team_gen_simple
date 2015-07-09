jQuery(document).ready(function($) {

	function parseEmails(account) {
		var parts = account.split('_');
		if(parts.length >= 2) {
			return parts[0] + ' ' + parts[1].split('@')[0];
		}

		return account;
	}


	function getAccounts() {
		$.get('/api/accounts', function(data) {

			var accounts = $.parseJSON(data).accounts;

			var $login = $('#login');

			accounts.forEach(function(account) {
				var parts = account.split('_');
				var $option = $('<option>').val(account).text(parseEmails(account));
				$login.append($option);
			});

		});
	}

	getAccounts();

	function getTeams(callback) {
		$.get('/api/teams', function(data) {

			var teams = $.parseJSON(data);

			var team0 = teams[0], team1 = teams[1];

			var $tbody0 = $('#tbody0');
			$tbody0.empty();

			var $tbody1 = $('#tbody1');
			$tbody1.empty();

			team0.forEach(function(account) {
				var tr = $('<tr></tr>');
				tr.append($('<td>' + parseEmails(account) + '</td>'));
				tr.appendTo($tbody0);
			});

			team1.forEach(function(account) {
				var tr = $('<tr></tr>');
				tr.append($('<td>' + parseEmails(account) + '</td>'));
				tr.appendTo($tbody1);
			})

			if(callback) {
				callback(data);
			}

		});
	}

	getTeams();

	setInterval(getTeams, 10000);

	function processMatches(number, $match) {

		$('.plane').addClass('hidden');

		var $shortMatch = $match;

		if(number) {
			var id = $match.attr('id');
			var otherId = id === 'match1' ? 'match0' : 'match1';

			$shortMatch = $('#' + otherId);
		}

		$shortMatch.children('.fire-match').addClass('short-match');
		$match.children('.fire-match-head').addClass('fire');

	}

	$('#getPassword').on('click', function(event) {
		event.preventDefault();

		var login = $('#login').val();

		$.get('/api/password?login=' + login, function(data) {
			$('#feedback').html(data);
		});

	});

	$('#reset').on('click', function(event) {
		event.preventDefault();

		var password = $('#admin-pass').val();

		$.get('/api/reset?password=' + password, function(data) {
			getTeams();
			$('#feedback').html(data);
		});

	});

	var $match = $('.match');

	$match.on('click', function(event) {
		event.preventDefault();

		var $currentTarget = $(event.currentTarget);

		var login = $('#login').val();
		var password = $('#password').val();

		$.get('/api/teamNumber?login=' + login + '&password=' + password, function(data) {
			var message = (data.teamNumber || data.teamNumber === 0) ? 'Your team number is:' + data.teamNumber : data;
			$('#feedback').html(message);

			if(data.teamNumber || data.teamNumber === 0) {
				processMatches(data.teamNumber, $currentTarget)
			}

			getTeams();
		});
		
	});


	$('#export').on('click', function(event) {
		event.preventDefault();
		getTeams(function(data) {
			JSONToCSVConvertor(data, "Teams", true);
		});
		
	});

	
});