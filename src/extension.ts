'use strict';

import * as vscode from 'vscode';

import Window = vscode.window;
import QuickPickItem = vscode.QuickPickItem;
import QuickPickOptions = vscode.QuickPickOptions;
import Document = vscode.TextDocument;
import Position = vscode.Position;
import Range = vscode.Range;
import Selection = vscode.Selection;
import TextDocument = vscode.TextDocument;
import TextEditor = vscode.TextEditor;
import InputBoxOptions = vscode.InputBoxOptions;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate ( context: vscode.ExtensionContext ) {

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand( 'extension.addToSelection', () => {
        let e = Window.activeTextEditor;
        let d = e.document;
        let { selections } = e;
        
        let options: InputBoxOptions = {
            prompt: 'Enter a number to add to the selected number(s)'
            , placeHolder: '7'
        };

        // Display a message box to the user
        vscode.window.showInputBox( options )
            .then( num => {
                if ( selections.length > 0 ) {
                    processSelection( e, d, selections, addNumbers, [ num ] );
                } else {
                    vscode.window.showInformationMessage( 'You must select some number text before to add a number to' )
                }
            });
    });

    context.subscriptions.push( disposable );
}

function addNumbers ( a: number, b: number ) : string {    
    return `${ ( +a ) + ( +b ) }`;
}

function processSelection ( e: TextEditor, d: TextDocument, sel: Selection[], formatCb, argsCb = [] ) {
    var replaceRanges: Selection[] = [];
    var numberToAdd = +argsCb[0];

    if ( !Number.isNaN( numberToAdd ) ) {
        e.edit( edit => {
            // itterate through the selections
            sel.forEach( ( item, i ) => {
                let txt: string = d.getText( new Range( item.start, item.end ) );
                let num: number = +txt;
                
                if ( numberToAdd ) {
                    txt = formatCb.apply( this, [ txt, numberToAdd ] );
                }

                edit.replace( sel[i], txt );
                let startPos: Position = new Position( item.start.line, item.start.character );
                let endPos: Position = new Position( item.start.line + txt.split( /\r\n|\r|\n/ ).length - 1, item.start.character + txt.length );
                replaceRanges.push( new Selection( startPos, endPos ) );
            });
        });

        e.selections = replaceRanges;
    } else {
        console.error( 'Input text is NaN!', numberToAdd );
    }
}

// this method is called when your extension is deactivated
export function deactivate () {
}
