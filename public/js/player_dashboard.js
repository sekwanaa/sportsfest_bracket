(function ($) {
  var joinTeamButton = $("#join_team_button");
  var submitCodeButton = $("#submit_team_code_button");
  var teamCodeInputDiv = $("#div_join_team_input");
  var createTeamButton = $("#create_team_button");
  var createTournamentBtn = $("#createTournamentBtn");
  var joinTournamentBtn = $("#joinTournamentBtn");

  //joining and creating tournaments variables
  var createTournamentDiv = $("#createTournamentDiv");
  var joinTournamentDiv = $("#joinTournamentDiv");

  //initialize items for editing team
  var editTeamButton = $("#edit_team_btn");
  var editTeamSubmitButton = $("#edit_team_submit_btn");
  var editTeamSubmitButtonDiv = $("#div_edit_team_submit_btn");
  var teamDisplayCard = $("#team_display_card");
  var editTeamDisplayCard = $("#edit_team_display_card");
  var editTeamMembersDiv = $("#edit_team_member");
  var editAddMemberBtn = $("#edit_add_more_button");
  var editRemoveMemberBtn = $("#edit_remove_button");

  // user profile card stuff
  var editProfileButton = $("#edit_profile_button");

  // divs which the inputs are in
  var nameUpdateDiv = $("#name_update_div");
  var positionUpdateDiv = $("#position_update_div");
  var shirtNumberUpdateDiv = $("#shirt_number_update_div");
  var uploadPicture = $("#upload_picture");
  var userPicture = $("#user_picture");

  // original fields with info
  var playerName = $("#player_name");
  var playerShirtNumber = $("#shirt_number");
  var playerPosition = $("#player_position");
  var submitProfileChangesButton = $("#submit_profile_changes_button");
  var submitUploadePicture = $("#picture_submit_button");

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
  var teamMember = $("#teamMember0");

  $("#edit_districtSelection").val($("#teamDistrict").html());

  while (teamMember.length != 0) {
    editTeamMembersDiv.append(
      '<input id="editTeamMemberInput' +
        teamMemberCount +
        '" type="text"></input><id="memberBreak' +
        teamMemberCount +
        '" br>'
    );
    $("#editTeamMemberInput" + teamMemberCount).val(teamMember.html());
    teamMemberCount++;
    teamMember = $("#teamMember" + teamMemberCount);
  }

  editProfileButton.click(function () {
    var playerNameInput = $("#player_name_input");
    var playerShirtNumberInput = $("#shirt_number_input");
    var playerPositionInput = $("#player_position_input");

    let playerNameContent = playerName.html();
    let playerShirtNumContent = playerShirtNumber.html();
    let playerPositionContent = playerPosition.html();

    profileClickCount += 1;
    if (editProfileButton.html() === "Cancel") {
      editProfileButton.html("Edit");
    } else {
      editProfileButton.html("Cancel");
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
        playerNameInput.val("No Name Chosen");
      }

      playerName.hide();
      uploadPicture.show();
      nameUpdateDiv.show();
      playerShirtNumberInput.val(playerShirtNumContent.split(" ")[2]);
      playerShirtNumber.hide();
      playerPositionInput.val(playerPositionContent.split(": ")[1]);
      positionUpdateDiv.show();
      playerPosition.hide();
      shirtNumberUpdateDiv.show();
      submitProfileChangesButton.show();
    }
  });

  submitProfileChangesButton.click(function () {
    // input fields
    var playerNameInput = $("#player_name_input").val();
    var playerShirtNumberInput = $("#shirt_number_input").val();
    var playerPositionInput = $("#player_position_input").val();

    try {
      //start pic upload
      let formData = new FormData();
      formData.append("user-image", $("#user_picture")[0].files[0]);

      $.ajax({
        url: "/player_dashboard/upload-image",
        method: "POST",
        data: formData,
        processData: false,
        contentType: false,
      }).then(function (res) {
        console.log(res);

        let req = {
          method: "POST",
          url: "/player_dashboard/submitProfile",
          contentType: "application/json",
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
    if (joinTeamButton.html() === "Cancel") {
      joinTeamButton.html("Join a Team");
    } else {
      joinTeamButton.html("Cancel");
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
    $("#edit_team_name").val($("#teamName").html());
    $("#edit_team_captain").val($("#teamCaptain").html());

    //toggle display for edit info for team changes
    if (editTeamButton.html() == "Cancel") {
      editTeamButton.html("Edit Team");
      editTeamSubmitButtonDiv.hide();
      teamDisplayCard.show();
      editTeamDisplayCard.hide();
    } else {
      editTeamButton.html("Cancel");
      editTeamSubmitButtonDiv.show();
      editTeamDisplayCard.show();
      teamDisplayCard.hide();

      //take current info and put them into input fields
    }
  });

  //Submit button to POST new team info
  editTeamSubmitButton.click(function () {
    //initialize inputs
    let teamName = $("#edit_team_name").val();
    let teamDistrict = parseInt($("#edit_districtSelection").val());
    let players = [];
    let teamCaptain = $("#edit_team_captain").val();
    var teamMember = null;

    //fill players array
    for (i = 0; i < teamMemberCount; i++) {
      teamMember = $("#editTeamMemberInput" + i);
      players.push(teamMember.val());
    }

    //ajax POST method to submit
    try {
      let req = {
        method: "POST",
        url: "/player_dashboard/editTeam",
        contentType: "application/json",
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
  submitCodeButton.click(function (event) {
    event.preventDefault();
    var teamCodeInput = $("#team_code_input");
    let joinCode = parseInt(teamCodeInput.val());

    try {
      let req = {
        method: "POST",
        url: "/player_dashboard/join_team",
        contentType: "application/json",
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
    $("#editTeamMemberInput" + (teamMemberCount - 1)).remove();
    teamMemberCount--;
    if (teamMemberCount < 1) {
      $(this).hide();
    }
  });

  //create and join tournament buttons
  createTournamentDiv.hide();
  createTournamentBtn.click((event) => {
    event.preventDefault();
    if (createTournamentBtn.html() == "Cancel") {
      createTournamentBtn.html("Create tournament");
      joinTournamentBtn.show();
      createTournamentDiv.hide();
    } else {
      createTournamentBtn.html("Cancel");
      joinTournamentBtn.hide();
      createTournamentDiv.show();
      //take current info and put them into input fields
    }
  });
  joinTournamentDiv.hide();
  joinTournamentBtn.click((event) => {
    event.preventDefault();
    if (joinTournamentBtn.html() == "Cancel") {
      joinTournamentBtn.html("Join tournament");
      createTournamentBtn.show();
      joinTournamentDiv.hide();
    } else {
      joinTournamentBtn.html("Cancel");
      createTournamentBtn.hide();
      joinTournamentDiv.show();
      //take current info and put them into input fields
    }
  });
})(window.jQuery);
