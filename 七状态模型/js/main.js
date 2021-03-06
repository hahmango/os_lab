// 对应的div元素
var newDiv = $('#new'),
    readyDiv = $('#ready'),
    runningDiv = $('#running'),
    blockedDiv = $('#blocked'),
		exitDiv = $('#exit'),
		readySuspendDiv = $('#readySuspend'),
		blockedSuspendDiv = $('#blockedSuspend');

// 在js中用队列存放进程变量
var newQueue = [],
		readyQueue = [],
		runningQueue = [],
		blockedQueue = [],
		exitQueue = [],
		readySuspendQueue = [],
		blockedSuspendQueue = [];

var priorityCache = [],
		processInfoCache = [];

var cmp = function(l, r) {
	if(l.priority < r.priority) {
		return -1;
	}
	else if(l.priority > r.priority) {
		return 1;
	}
	return 0;
}
const maxMemory = 100;
const highLightColor = "#F1C40F";
const normalColor = "green";
var usedMemory = 0;
var totalProcessNum = 0;


function processModel () {
	this.myCss = $('<div class="process"></div>');
	this.memSize = Math.floor(Math.random() * 60 + 1);
	this.pid = ++totalProcessNum;
	this.priority = Math.floor(Math.random() * 3 + 1);
}

function prepareHover() {
	$('.process').hover(
		function () {
			$(this).animate({ width: '170px' }, 200);
			let cache = $(this).text();
			let index = parseInt(cache[1] + cache[2]);
			$(this).text(processInfoCache[index] + priorityCache[index]);
		},
		function () {
			let cache = $(this).text();
			let index = parseInt(cache[1] + cache[2]);
			$(this).text(processInfoCache[index]);
			$(this).animate({ width: '100px' }, 200);
		}
	);
}

processModel.prototype.showRunningPCB = function () {
	$('#rPid').text(this.pid);
	$('#rMemory').text(this.memSize + 'M');
	$('#rPriority').text(this.priority);
};

processModel.prototype.showHighlightPCB = function () {
	$('#hPid').text(this.pid);
	$('#hMemory').text(this.memSize + 'M');
	$('#hPriority').text(this.priority);
};

function emptyRunningPCB() {
	$('#rPid').text('');
	$('#rMemory').text('');
	$('#rPriority').text('');
}

function emptyHighlightPCB() {
	$('#hPid').text('');
	$('#hMemory').text('');
	$('#hPriority').text('');
}

function highlight(process) {
	process.myCss.animate({ backgroundColor: highLightColor }, 1000);
	process.showHighlightPCB();
}

function normalize(process) {
	process.myCss.animate({ backgroundColor: normalColor }, 1000);
	setTimeout(() => {
		emptyHighlightPCB(process);
	}, 1000);
}

function updateUsedMemory(isAdd, memSize) {
	if(isAdd) {
		usedMemory += memSize;
	}
	else {
		usedMemory -= memSize;
	}
	$('#usedMem').text(usedMemory);
}

function putInReady(process) {
	'use strict';
	updateUsedMemory(true, process.memSize);
	readyDiv.append(process.myCss);
	readyQueue.sort(cmp);
	readyQueue.push(process);
	setTimeout(() => {
		if(runningQueue.length === 0) {
			if(readyQueue.length > 1) {
				normalize(process);
			}
			dispatch();
		}
		else {
			normalize(process);
		}
	}, 1000);
}

function putInExit() {
	'use strict';
	if(runningQueue.length === 0) {
		
	}
	else {
		let process = runningQueue.shift();
		updateUsedMemory(false, process.memSize);
		exitQueue.push(process);
		exitQueue.sort(cmp);
		exitDiv.append(process.myCss);
		normalize(process);
	}
}


// create
var create = function () {
	'use strict';
	let process = new processModel();
	process.myCss.text('P' + process.pid + ' - ' + process.memSize + 'M');
	processInfoCache[process.pid] = process.myCss.text();
	priorityCache[process.pid] = ' 优先级：' + process.priority;
	newDiv.append(process.myCss);
	prepareHover();
	highlight(process);
	setTimeout(() => {
		if (newQueue.length === 0 && process.memSize <= maxMemory - usedMemory) {
			putInReady(process);
		}
		else {
			newQueue.push(process);
			newQueue.sort(cmp);
			normalize(process);
		}
	}, 1000);
}

// admit
var admit = function () {
	'use strict';
	if(newQueue.length === 0) {
		alert('没有需要admit的进程');
		return;
	}
	let process = newQueue.shift();
	highlight(process);
	setTimeout(() => {
		if (process.memSize <= maxMemory - usedMemory) {
			readyDiv.append(process.myCss);
			readyQueue.push(process);
			readyQueue.sort(cmp);
			putInReady(process);
		}
		else {
			newQueue.unshift(process);
			alert('内存不足！');
			normalize(process);
		}
	}, 1000);
}

// release
var release = function () {
	'use strict';
	if(runningQueue.length === 0) {
		alert('没有正在运行的进程，无需释放！');
	}
	else {
		highlight(runningQueue[0]);
		setTimeout(() => {
			putInExit();
			emptyRunningPCB();
			dispatch();
		}, 1000);
	}
}

// dispatch
var dispatch = function () {
	'use strict';
	if (runningQueue.length > 0) {
		alert('已有进程正在运行！');
	}
	else if (readyQueue.length === 0) {
		alert('没有可以运行的进程！');
	}
	else {
		highlight(readyQueue[0]);
		let process = readyQueue.shift();
		runningQueue.push(process);
		setTimeout(() => {
			runningQueue.sort(cmp);
			runningQueue[0].showRunningPCB();
			runningDiv.append(process.myCss);
		}, 1000);
		normalize(process);
	}
}

// eventWait
var eventWait = function () {
	if(runningQueue.length === 0) {
		alert('没有正在运行的进程！');
	}
	else {
		highlight(runningQueue[0]);
		let process = runningQueue.shift();
		setTimeout(() => {
			blockedQueue.sort(cmp);
			blockedQueue.push(process);
			blockedDiv.append(process.myCss);
			emptyRunningPCB();
			dispatch();
		}, 1000);
		normalize(process);
	}
}

// eventOccurs
var eventOccurs = function () {
	if(blockedQueue.length === 0) {
		alert('当前没有进程被阻塞');
	}
	else {
		highlight(blockedQueue[0]);
		let process = blockedQueue.shift();
		setTimeout(() => {
			usedMemory -= process.memSize;
			putInReady(process);
		}, 1000);
	}
}

// timeout
var timeout = function () {
	if(runningQueue.length === 0) {
		alert('没有正在运行的进程');
	}
	else {
		highlight(runningQueue[0]);
		setTimeout(() => {
			let process = runningQueue.shift();
			readyQueue.push(process);
			readyQueue.sort(cmp);
			readyDiv.append(process.myCss);
			emptyRunningPCB();
			normalize(process);
			dispatch();
		}, 1000);
	}
}
// TODO: sort before push
// ready suspend
var readySuspend = function() {
	if(readyQueue.length === 0) {
		alert('没有处于Ready的进程');
	}
	else {
		highlight(readyQueue[0]);
		let process = readyQueue.shift();
		setTimeout(() => {
			readySuspendQueue.sort(cmp);
			readySuspendQueue.push(process);
			readySuspendDiv.append(process.myCss);
			updateUsedMemory(false, process.memSize);
			normalize(process);
		}, 1000);
	}
}

// ready activate
var readyActivate = function () {
	if(readySuspendQueue.length === 0) {
		alert('没有处于Ready Suspend的进程');
		return;
	}
	highlight(readySuspendQueue[0]);
	let process = readySuspendQueue.shift();
	setTimeout(() => {
		if(process.memSize > maxMemory - usedMemory) {
			readySuspendQueue.unshift(process);
			alert('内存不足！');
			normalize(process);
		}
		else {
			putInReady(process);
		}
	}, 1000);
}

// blocked suspend
var blockedSuspend = function name() {
	if(blockedQueue.length === 0) {
		alert('没有处于Blocked的进程');
	}
	else {
		highlight(blockedQueue[0]);
		let process = blockedQueue.shift();
		setTimeout(() => {
			blockedSuspendQueue.sort(cmp);
			blockedSuspendQueue.push(process);
			blockedSuspendDiv.append(process.myCss);
			updateUsedMemory(false, process.memSize);
			normalize(process);
		}, 1000);
	}
}

// blocked activate
var blockedActivate = function () {
	if(blockedSuspendQueue.length === 0) {
		alert('没有处于Blocked Suspend的进程');
	}
	highlight(blockedSuspendQueue[0]);
	let process = blockedSuspendQueue.shift();
	setTimeout(() => {
		if(process.memSize > maxMemory - usedMemory) {
			blockedSuspendQueue.unshift(process);
			alert('内存不足');
			normalize(process);
		}
		else {
			blockedQueue.sort(cmp);
			blockedQueue.push(process);
			blockedDiv.append(process.myCss);
			updateUsedMemory(true, process.memSize);
			normalize(process);
		}
	}, 1000);
}

$('#create').click(create);
$('#admit').click(admit);
$('#release').click(release);
$('#dispatch').click(dispatch);
$('#ewait').click(eventWait);
$('#eoccurs').click(eventOccurs);
$('#timeout').click(timeout);
$('#readyToSuspend').click(readySuspend);
$('#readyActivate').click(readyActivate);
$('#blockedToSuspend').click(blockedSuspend);
$('#blockedActivate').click(blockedActivate);
// TODO: 闪回bug, outsideEvnetOccurs未实现

function initial() {
	'use strict';
	$('#usedMem').text(usedMemory);
}

initial();