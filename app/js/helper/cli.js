/* requires { Neutralino }

	== many helper functions == */

// run a ttbl command
async function ttblRun(params, parse) {
	let path = NL_PATH + "/modules/ttbl-cli/src"; // when "neu run", ttbl is in that path
	if (parse) {
		return await Neutralino.os.execCommand(path + "/ttblparse " + params);
	}	else {
		return await Neutralino.os.execCommand(path + "/ttbl " + params);
	}
}

// fetch the timetable using ttbl-cli
export async function fetchTimetable() {
	let output = await ttblRun("--sync 14 2");
	if (output.exitCode > 0) {
		throw new Error("Couldn't fetch timetable");
	}
}

// fetch the token using ttbl-cli
export async function fetchToken(student_id, pass) {
	let output = await ttblRun(`--token "${student_id}" "${pass}"`);
	if (output.exitCode > 0) {
		throw new Error("Couldn't fetch token");
	}
}

// get today's classes using ttbl-cli
export async function getClasses() {
	// ttblparse expects the time when it should fetch tomorrows' class today as the second arg
	let classes = await ttblRun("-4 17 " + NL_PATH, true);
	console.log(classes)
	if (classes.exitCode > 0) {
		throw new Error("No token provided");
	}
	classes = classes.stdOut.split(/\r?\n/).filter(element => element); // split by newline
	for (let sub in classes) {
		classes[sub] = classes[sub].split(/;/).filter(element => element); // split by delimiting colons
		let subject = {};
		subject["period"] = classes[sub][0]; // use the split values
		subject["room"] = classes[sub][1];
		subject["class"] = classes[sub][2];
		subject["start"] = classes[sub][3];
		subject["end"] = classes[sub][4];
		subject["teacher"] = classes[sub][5];
		subject["colour"] = classes[sub][6];
		classes[sub] = subject;
	}
	return classes;
}
