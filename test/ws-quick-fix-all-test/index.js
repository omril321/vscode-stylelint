'use strict';

const path = require('path');
const pWaitFor = require('p-wait-for');
const test = require('tape');
const { extensions, workspace, window, Uri, commands, Position } = require('vscode');
const { normalizeDiagnostic, getStylelintDiagnostics } = require('../utils');

const run = () =>
	test('vscode-stylelint quickfix a file', async (t) => {
		await commands.executeCommand('vscode.openFolder', Uri.file(__dirname));

		const vscodeStylelint = extensions.getExtension('stylelint.vscode-stylelint');

		// Open the './test.css' file.
		const cssDocument = await workspace.openTextDocument(path.resolve(__dirname, 'test.css'));

		await window.showTextDocument(cssDocument);

		// Wait for diagnostics result.
		await pWaitFor(() => vscodeStylelint.isActive, { timeout: 2000 });
		await pWaitFor(() => getStylelintDiagnostics(cssDocument.uri).length > 0, { timeout: 5000 });

		await pWaitFor(
			() => cssDocument.validatePosition(new Position(2, 3).isEqual(new Position(2, 3))),
			{ timeout: 5000 },
		);
		//TODO: open quick fix => "clikc" the fix option
		// Check the result.
		const diagnostics = getStylelintDiagnostics(cssDocument.uri);

		t.deepEqual(
			diagnostics.map(normalizeDiagnostic),
			[
				{
					range: { start: { line: 1, character: 0 }, end: { line: 1, character: 0 } },
					message: 'unused rule: foo, start line: 2, end line: 2',
					severity: 1,
					code: 'foo',
					source: 'stylelint',
				},
				{
					range: { start: { line: 2, character: 0 }, end: { line: 2, character: 32 } },
					message: 'unused rule: foo, start line: 3, end line: 3',
					severity: 1,
					code: 'foo',
					source: 'stylelint',
				},
				{
					range: { start: { line: 4, character: 0 }, end: { line: 5, character: 26 } },
					message: 'unused rule: foo, start line: 5, end line: 6',
					severity: 1,
					code: 'foo',
					source: 'stylelint',
				},
			],
			'should work if "stylelint.reportInvalidScopeDisables" is enabled.',
		);

		t.end();
	});

exports.run = (root, done) => {
	test.onFinish(done);
	run();
};
