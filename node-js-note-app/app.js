//console.log('Starting app.js');

const fs = require('fs');
const _ = require('lodash');
const yargs = require('yargs');

const notes = require('./notes.js');

const titleOptions = {
			describe: 'Title of note',
			demand: true,
			alias: 't'
		};

const bodyOptions = {
			describe: 'Body of the note',
			demand: true,
			alias: 'b'
		};
		
const argv = yargs
	.command('add', 'Add a new note', {
		title: titleOptions,
		body: bodyOptions
	})
	.command('list', 'List of all notes')
	.command('read', 'Read a note', {
		title: titleOptions
	})
	.command('remove', 'Remove a note', {
		title: titleOptions
	})
	.help()
	.argv;
var command = argv._[0];
console.log('Command: ', command);
//console.log('Yargs', argv);


if(command === 'add') {
	var note = notes.addNote(argv.title, argv.body);
	if(note) {
		console.log('Note Added: ');
		notes.logNote(note);
	}
}else if(command === 'list') {
	var allNotes = notes.getAll();
	console.log(`\nPrinting ${allNotes.length} note's:\n`)
	allNotes.forEach((note) => notes.logNote(note));
}else if(command === 'read') {
	var note = notes.getNote(argv.title);
	if(note) {
		console.log('Note Found: ');
		notes.logNote(note);
	}else {
		console.log('Note not found.');
	}
}else if(command === 'remove') {
	if(notes.removeNote(argv.title)) {
		console.log(`'${argv.title}' note removed.`);
	}else {
		console.log(`'${argv.title}' note not found.`);
	}
}else {
	console.log('Command not recognized');
}