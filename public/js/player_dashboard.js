(function ($) {
	//clickable things
	var joinTeamButton = $('#join_team_button');
	var submitTeamCodeButton = $('#submit_team_code_button');
	var teamCodeInputDiv = $('#div_join_team_input');
	var createTeamButton = $('#create_team_button');
	var createTournamentBtn = $('#createTournamentBtn');
	var joinTournamentBtn = $('#joinTournamentBtn');
	var submitTournamentCodeBtn = $('#submitTournamentCodeBtn');
	var tournamentPreviousBtn = $('#previous_button');
	var tournamentNextBtn = $('#next_button');
	var tournamentLink = $('.tournamentLink');
	var manageTeamElementBackBtn = $('#manageTeamElementBackBtn');
	var tournamentSport = $('.tournamentSport');

	//joining and creating tournaments variables
	var createTournamentDiv = $('#createTournamentDiv');
	var joinTournamentDiv = $('#joinTournamentDiv');

	//used to navigate pages of the Create Tournament Card
	let createTournamentArray = [];
	let sportsListArray = [];
	var sportsQuestionsDiv = $('#create_tournament_sports_questions');
	createTournamentArray.push(sportsQuestionsDiv);
	var createTournamentPageCounter = 0;
	var submitTournamentButton = $('#submit_tournament_info_div');

	//initialize items for editing team
	var editTeamButton = $('#edit_team_btn');
	var editTeamSubmitButton = $('#edit_team_submit_btn');
	var editTeamSubmitButtonDiv = $('#div_edit_team_submit_btn');
	var teamDisplayCard = $('#team_display_card');
	var editTeamDisplayCard = $('#edit_team_display_card');
	var editTeamMembersDiv = $('#edit_team_member');
	var editAddMemberBtn = $('#edit_add_more_button');
	var editRemoveMemberBtn = $('#edit_remove_button');

	// user profile card stuff
	var editProfileButton = $('#edit_profile_button');

	// divs which the inputs are in
	var nameUpdateDiv = $('#name_update_div');
	var positionUpdateDiv = $('#position_update_div');
	var shirtNumberUpdateDiv = $('#shirt_number_update_div');
	var uploadPicture = $('#upload_picture');
	var userPicture = $('#user_picture');

	// original fields with info
	var playerName = $('#player_name');
	var playerShirtNumber = $('#shirt_number');
	var playerPosition = $('#player_position');
	var submitProfileChangesButton = $('#submit_profile_changes_button');
	var submitUploadePicture = $('#picture_submit_button');

	// console.log(uploadPicture)

	nameUpdateDiv.hide();
	positionUpdateDiv.hide();
	shirtNumberUpdateDiv.hide();
	submitProfileChangesButton.hide();
	uploadPicture.hide();
	let profileClickCount = 0;
	let joinTeamClickCount = 0;

	//hide edit team divs on page load
	editTeamSubmitButtonDiv.hide();
	editTeamDisplayCard.hide();

	//create input fields for making changes to the team
	let teamMemberCount = 0;
	var teamMember = $('#teamMember0');

	$('#edit_districtSelection').val($('#teamDistrict').html());

	while (teamMember.length != 0) {
		editTeamMembersDiv.append(
			'<input id="editTeamMemberInput' +
				teamMemberCount +
				'" type="text"></input><id="memberBreak' +
				teamMemberCount +
				'" br>'
		);
		$('#editTeamMemberInput' + teamMemberCount).val(teamMember.html());
		teamMemberCount++;
		teamMember = $('#teamMember' + teamMemberCount);
	}

	editProfileButton.click(function () {
		var playerNameInput = $('#player_name_input');
		var playerShirtNumberInput = $('#shirt_number_input');
		var playerPositionInput = $('#player_position_input');

		let playerNameContent = playerName.html();
		let playerShirtNumContent = playerShirtNumber.html();
		let playerPositionContent = playerPosition.html();

		profileClickCount += 1;
		if (editProfileButton.html() === 'Cancel') {
			editProfileButton.html('Edit');
		} else {
			editProfileButton.html('Cancel');
		}
		if (profileClickCount % 2 == 0) {
			//on second click
			playerName.show();
			uploadPicture.hide();
			nameUpdateDiv.hide();
			playerShirtNumber.show();
			positionUpdateDiv.hide();
			playerPosition.show();
			shirtNumberUpdateDiv.hide();
			submitProfileChangesButton.hide();
		} else {
			//on first click

			if (playerNameContent) {
				playerNameInput.val(playerNameContent);
			} else {
				nameUpdateDiv.show();
				playerNameInput.val('No Name Chosen');
			}

			playerName.hide();
			uploadPicture.show();
			nameUpdateDiv.show();
			playerShirtNumberInput.val(playerShirtNumContent.split(' ')[2]);
			playerShirtNumber.hide();
			playerPositionInput.val(playerPositionContent.split(': ')[1]);
			positionUpdateDiv.show();
			playerPosition.hide();
			shirtNumberUpdateDiv.show();
			submitProfileChangesButton.show();
		}
	});

	submitProfileChangesButton.click(function () {
		// input fields
		var playerNameInput = $('#player_name_input').val();
		var playerShirtNumberInput = $('#shirt_number_input').val();
		var playerPositionInput = $('#player_position_input').val();

		try {
			//start pic upload
			let formData = new FormData();
			formData.append('user-image', $('#user_picture')[0].files[0]);

			$.ajax({
				url: '/player_dashboard/upload-image',
				method: 'POST',
				data: formData,
				processData: false,
				contentType: false,
			}).then(function (res) {
				console.log(res);

				let req = {
					method: 'POST',
					url: '/player_dashboard/submitProfile',
					contentType: 'application/json',
					data: JSON.stringify({
						name: playerNameInput,
						shirtNum: parseInt(playerShirtNumberInput),
						position: playerPositionInput,
					}),
				};
				$.ajax(req).then(function (res) {
					// reload the page AFTER everything is done
					location.reload();
				});
			});
		} catch (e) {
			console.log(e);
		}
	});

	// team code input div
	teamCodeInputDiv.hide();

	joinTeamButton.click(function () {
		joinTeamClickCount += 1;
		if (joinTeamButton.html() === 'Cancel') {
			joinTeamButton.html('Join a Team');
		} else {
			joinTeamButton.html('Cancel');
		}

		if (joinTeamClickCount % 2 == 0) {
			teamCodeInputDiv.hide();
			createTeamButton.show();
		} else {
			teamCodeInputDiv.show();
			createTeamButton.hide();
		}
	});

	//when edit Team is clicked, user should see inputs for team info
	editTeamButton.click(function () {
		//take current team info and place them in editable inputs
		$('#edit_team_name').val($('#teamName').html());
		$('#edit_team_captain').val($('#teamCaptain').html());
		$('#edit_districtSelection').val($('#teamDistrict').html());

		//toggle display for edit info for team changes
		if (editTeamButton.html() == 'Cancel') {
			editTeamButton.html('Edit Team');
			editTeamSubmitButtonDiv.hide();
			teamDisplayCard.show();
			editTeamDisplayCard.hide();
		} else {
			editTeamButton.html('Cancel');
			editTeamSubmitButtonDiv.show();
			editTeamDisplayCard.show();
			teamDisplayCard.hide();

			//take current info and put them into input fields
		}
	});

	//Submit button to POST new team info
	editTeamSubmitButton.click(function () {
		//initialize inputs
		let teamName = $('#edit_team_name').val();
		let teamDistrict = parseInt($('#edit_districtSelection').val());
		let players = [];
		let teamCaptain = $('#edit_team_captain').val();
		var teamMember = null;

		//fill players array
		for (i = 0; i < teamMemberCount; i++) {
			teamMember = $('#editTeamMemberInput' + i);
			players.push(teamMember.val());
		}

		//ajax POST method to submit
		try {
			let req = {
				method: 'POST',
				url: '/player_dashboard/editTeam',
				contentType: 'application/json',
				data: JSON.stringify({
					name: teamName,
					district: teamDistrict,
					players: players,
					teamCaptain: teamCaptain,
				}),
			};
			$.ajax(req).then(function (res) {
				//page reload on submit
				location.reload();
			});
		} catch (e) {
			console.log(e);
		}
	});

	// Submit code button stuff to join a team
	submitTeamCodeButton.click(function (event) {
		event.preventDefault();
		var teamCodeInput = $('#team_code_input');
		let joinCode = parseInt(teamCodeInput.val());

		try {
			let req = {
				method: 'POST',
				url: '/player_dashboard/join_team',
				contentType: 'application/json',
				data: JSON.stringify({
					code: joinCode,
				}),
			};
			$.ajax(req).then(function (res) {});
		} catch (e) {
			console.log(e);
		}

		//clear all input fields
	});

	//add member button for edit team display
	editAddMemberBtn.click(function (event) {
		editRemoveMemberBtn.show();
		editTeamMembersDiv.append(
			'<input id="editTeamMemberInput' +
				teamMemberCount +
				'" type="text"></input><id="memberBreak' +
				teamMemberCount +
				'" br>'
		);
		teamMemberCount++;
	});

	//remove member function for edit team display
	editRemoveMemberBtn.click(function (event) {
		$('#editTeamMemberInput' + (teamMemberCount - 1)).remove();
		teamMemberCount--;
		if (teamMemberCount < 1) {
			$(this).hide();
		}
	});

	//create and join tournament buttons
	createTournamentDiv.hide();
	createTournamentBtn.click(event => {
		event.preventDefault();
		if (createTournamentBtn.html() == 'Cancel') {
			createTournamentBtn.html('Create tournament');
			joinTournamentBtn.show();
			createTournamentDiv.hide();
		} else {
			createTournamentBtn.html('Cancel');
			joinTournamentBtn.hide();
			createTournamentDiv.show();
			//take current info and put them into input fields
		}
	});

	//join tournament button
	joinTournamentDiv.hide();
	joinTournamentBtn.click(function (event) {
		event.preventDefault();
		if (joinTournamentBtn.html() == 'Cancel') {
			joinTournamentBtn.html('Join tournament');
			createTournamentBtn.show();
			joinTournamentDiv.hide();
		} else {
			joinTournamentBtn.html('Cancel');
			createTournamentBtn.hide();
			joinTournamentDiv.show();
			//take current info and put them into input fields
		}
	});

	//submit tournament code button
	submitTournamentCodeBtn.click(event => {
		event.preventDefault();
		var tournamentCodeInput = $('#joinTournamentCodeInput');
		const joinCode = parseInt(tournamentCodeInput.val());

		try {
			let req = {
				method: 'POST',
				url: '/player_dashboard/join_tournament',
				contentType: 'application/json',
				data: JSON.stringify({
					tournamentCode: joinCode,
				}),
			};
			$.ajax(req).then(function (res) {
				//page reload on submit
				location.reload();
			});
		} catch (e) {
			console.log(e);
		}
	});

	// tournamentSport.addClass('hidden');

	tournamentLink.click(event => {
		event.preventDefault();
		tournamentLink.addClass('hidden');
		// tournamentSport.removeClass('hidden');

		var showSportsForTournament = $(".sport_"+event.target.id);
		showSportsForTournament.removeClass('hidden');
	});

	tournamentSport.click(event => {
		event.preventDefault();
		const joinedTournamentsList = $('#joinedTournamentsList');
		joinedTournamentsList.addClass('hidden');

		const manageTeamElement = $('#manageTeamElement');
		manageTeamElement.removeClass('hidden');

		//show tournamentName with label ID on the next "page"
		var teamSportName = $('#team_sport_name');
		teamSportName.append(
			"<p id='" +
				event.target.id +
				"' class='team_sport_name_class'>" +
				event.target.innerHTML +
				'</p>'
		);

		//check if player has team - POST to checkPlayerTeam

		var sportId = event.target.id;

		try {
			let req = {
				method: 'POST',
				url: window.location.pathname + '/check_player_team',
				contentType: 'application/json',
				data: JSON.stringify({
					sportId: sportId,
				}),
			};
			$.ajax(req).then(function (res) {
				//populate fields for team on completion
				if(res != null) {
					var hasTeamDiv = $("#doesHaveTeam");
					hasTeamDiv.removeClass("hidden");

					var teamName = $("#teamName");
					var teamCaptain = $("#teamCaptain");
					var district = $("#teamDistrict");
					var teamMembersDiv = $(".teamMemberName");
	
					teamName.text(res.name);
					teamCaptain.text(res.teamCaptain);
					district.text(res.district);
	
					//remove any previous data from team member div
					teamMembersDiv.empty();
					
					for(let i = 0; i < res.players.length; i++) {
						teamMembersDiv.append(
							"<p id='teamMember"+i+"'>"+res.players[i]+"</p>"
						)
					}
				}

				else {
					var noTeamDiv = $("#noTeamDiv");
					noTeamDiv.removeClass("hidden");
					console.log("no team");
				}

			});
		} catch (e) {
			console.log(e);
		}

	});

	manageTeamElementBackBtn.click(event => {
		event.preventDefault();
		const joinedTournamentsList = $('#joinedTournamentsList');
		const manageTeamElement = $('#manageTeamElement');
		manageTeamElement.addClass('hidden');
		joinedTournamentsList.removeClass('hidden');

		//remove selected tournament Name/Id in current team card
		var teamSportName = $('.team_sport_name_class');
		teamSportName[0].remove();
	});

	//next button for create tournment
	tournamentNextBtn.click(event => {
		//check what page number to determine action

		if (createTournamentPageCounter == 0) {
			var sportsListDiv = $('#create_tournament_sports_list');
			var sportsCheckList = $('.sports_list_input');

			sportsListDiv.hide();

			for (let i = 0; i < sportsCheckList.length; i++) {
				if (sportsCheckList[i].checked == true) {
					sportsQuestionsDiv.append(
						'<div id="sports_questions_' +
							sportsCheckList[i].value +
							'" class="sports_questions_class" hidden="true">\
              <h3 id="sports_questions_' +
							sportsCheckList[i].value +
							'_sport">' +
							sportsCheckList[i].value +
							'</h3>\
              </br>\
              <p>How many games will each team play?</p>\
              <input id="sports_questions_' +
							sportsCheckList[i].value +
							'_seedingGames" type="number" required>\
              <p>How many fields will be used?</p>\
              <input id="sports_questions_' +
							sportsCheckList[i].value +
							'_numOfFields" type="number" required>\
              <p>How many teams will make it to playoffs?</p>\
              <input id="sports_questions_' +
							sportsCheckList[i].value +
							'_numOfPlayOffTeams" type="number" required>\
              </br></br>\
            </div>'
					);
					var tmpSportsListItem = $('#sports_questions_' + sportsCheckList[i].value + '');
					createTournamentArray.push(tmpSportsListItem);
					sportsListArray.push(tmpSportsListItem);
				}
			}
			createTournamentArray.push(submitTournamentButton);
			//show first sports question div
			createTournamentPageCounter++;
			createTournamentArray[createTournamentPageCounter].show();
		} else if (createTournamentPageCounter >= createTournamentArray.length - 1) {
			createTournamentArray[createTournamentPageCounter].hide();
			createTournamentPageCounter++;
			createTournamentArray[createTournamentPageCounter].show();
		} else {
			createTournamentArray[createTournamentPageCounter].hide();
			createTournamentPageCounter++;
			createTournamentArray[createTournamentPageCounter].show();
		}
	});

	//previous button for create tournment
	tournamentPreviousBtn.click(event => {
		if (createTournamentPageCounter > 1) {
			createTournamentArray[createTournamentPageCounter].hide();
			createTournamentPageCounter--;
			createTournamentArray[createTournamentPageCounter].show();
		}
	});

	//submit tournament info
	submitTournamentButton.click(event => {
		event.preventDefault();

		let tournamentName = $('#tournament_name').val();
		let privacySetting = $('#privacy_question').val();

		let poolObj = {
			tournamentName: tournamentName,
			sports: [],
			stage: 1,
			coordinator: '',
			privacy: privacySetting,
			players: [],
		};

		let sportsPool = [];

		for (let i = 0; i < sportsListArray.length; i++) {
			let sportsListString = sportsListArray[i].attr('id');
			let sportName = $('#' + sportsListString + '_sport').html();
			let numOfFields = parseInt($('#' + sportsListString + '_numOfFields').val());
			let numOfSeedingGames = parseInt($('#' + sportsListString + '_seedingGames').val());
			let numOfPlayoffTeams = parseInt($('#' + sportsListString + '_numOfPlayOffTeams').val());

			let tmpSportObj = {
				sport: sportName,
				numOfFields: numOfFields,
				numOfSeedingGames: numOfSeedingGames,
				numOfPlayoffTeams: numOfPlayoffTeams,
				scheduleType: null,
				teams: [],
				schedule: [],
				playoffs: [],
			};
			sportsPool.push(tmpSportObj);
		}

		//ajax POST method
		try {
			let req = {
				method: 'POST',
				url: window.location.pathname + '/create_pool',
				contentType: 'application/json',
				data: JSON.stringify({
					poolObj: poolObj,
					sportsPool: sportsPool,
				}),
			};
			$.ajax(req).then(function (res) {
				//page reload on submit
				// location.reload();
			});
		} catch (e) {
			console.log(e);
		}
	});
})(window.jQuery);
