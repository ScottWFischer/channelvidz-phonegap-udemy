$(document).ready(function(){
  document.addEventListener('deviceready',onDeviceReady, false);
})

function onDeviceReady(){

  // Check localStorage for channel
  if(localStorage.channel == null || localStorage.channel == '') {
    // Ask user for channel
    console.log('Opening popupDialog');
    $('#popupDialog').popup("open");
  } else {
    console.log('Not opening popupDialog');
    var channel = localStorage.getItem('channel');
  }

  getPlaylist(channel);

  $(document).on('click', '#vidlist li', function() {
    showVideo($(this).attr('videoId'));
  });

  $('#channelBtnOK').click(function() {
    var channel= $('#channelName').val();
    setChannel(channel);
    getPlaylist(channel);
  });

  $('#saveOptions').click(function(){
    saveOptions();
  });

  $('#clearChannel').click(function(){
    clearChannel();
  });

  $(document).on('pageinit', '#options', function(e){
    console.log('Options Page Loaded');
    var channel = localStorage.getItem('channel');
    var maxResults = localStorage.getItem('maxresults');
    $('#channelNameOptions').attr('value', channel);
    $('#maxResultsOptions').attr('value', maxResults);
  });
}

function getPlaylist(channel){
  $('#vidlist').html('');
  $.get(
    "https://www.googleapis.com/youtube/v3/channels",
    {
      part: 'contentDetails',
      forUsername: channel,
      key: 'AIzaSyAcCNP6ERlrOTZZwMj7vEZ1_fWuM5KKBho'
    },
    function(data){
      $.each(data.items, function(i, item){
        console.log(item);
        playlistId = item.contentDetails.relatedPlaylists.uploads;
        getVideos(playlistId, localStorage.getItem('maxresults'));
      });
    }
  );
}

function getVideos(playlistId, maxResults){
  $.get(
    "https://www.googleapis.com/youtube/v3/playlistItems",
    {
      part: 'snippet',
      maxResults: maxResults,
      playlistId: playlistId,
      key: 'AIzaSyAcCNP6ERlrOTZZwMj7vEZ1_fWuM5KKBho'
    }, function (data) {
      var output;
      $.each(data.items, function(i, item){
        id = item.snippet.resourceId.videoId;
        title = item.snippet.title;
        thumb = item.snippet.thumbnails.default.url;
        $('#vidlist').append('<li videoId="'+id+'"><img src="'+thumb+'"><h3>'+title+'</h3></li>');
        $('#vidlist').listview('refresh');
      });
    }
  );
}

function showVideo(id){
  console.log('Showing video ' + id);
  $('#logo').hide();
  var output = '<iframe width="100%" height="315" src="https://www.youtube.com/embed/'+id+'" frameborder="0" allowfullscreen></iframe>';
  $('#showVideo').html(output);
}

function setChannel(channel) {
  localStorage.setItem('channel', channel);
  console.log('Channel Set: '+channel);
}

function saveOptions() {
  var channel = $('#channelNameOptions').val();
  setChannel(channel);
  var maxResults = $('#maxResultsOptions').val();
  setMaxResults(maxResults);

  $('body').pagecontainer('change', '#main', {options});
  getPlaylist(channel);
}

function setMaxResults(maxResults) {
  localStorage.setItem('maxresults', maxResults);
  console.log('Max results: '+maxResults);
}

function clearChannel() {
  localStorage.removeItem('channel');
  $('body').pagecontainer('change', '#main', {options});
  // clear list
  $('#vidlist').html('');
  $('#popupDialog').popup("open");
}
