//console.log('Starting notes.js');
var fs = require('fs');

//for fetching the data from json file
var fetchNotes = () => {
	try {
		var noteString = fs.readFileSync('note-data.json');
		return JSON.parse(noteString);
	}catch (e) {
		return [];
	}
};

//for writing the data in the json file
var writeNotes = (notes) => {
	fs.writeFileSync('note-data.json', JSON.stringify(notes));
}

//for adding note
var addNote = (title, body) => {
	var notes = [];
	var note = {
		title,
		body
	};

	notes = fetchNotes();
	var duplicateNote = notes.filter((note) => note.title === title);
	if(duplicateNote.length === 0) {
		notes.push(note);
		writeNotes(notes);
		return note;
	}else {
		console.log("Duplicate Note can't be added.");
	}
	
};

//for getting all notes
var getAll = () => {
	return fetchNotes();
};

//for getting only the specified note
var getNote = (title) => {
	var notes = fetchNotes();
	var filteredNotes = notes.filter((note) => note.title === title);
	return filteredNotes[0];
	console.log(filteredNotes);
};

//delete a note
var removeNote = (title) => {
	notes = fetchNotes();
	var filteredNotes = notes.filter((note) => note.title !== title);
	writeNotes(filteredNotes);

	return notes.length !== filteredNotes.length;
};

//for showing
var logNote = (note) => {
	console.log(`Title: ${note.title}`);
	console.log(`Body: ${note.body}\n`);
}

module.exports = {
	addNote,
	getAll,
	getNote,
	removeNote,
	logNote
};