/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package snakeed;

import java.util.ArrayList;

/**
 *
 * @author damian
 */
public class DebugConsole {
    private static ArrayList<String> logToPrint;
    private static ArrayList<String> logToSave;
    private static ArrayList<String> commandBuffer;
    private static String inputLine = "";
    private static int commandBufferCounter = 0;
    
    public DebugConsole(){
        logToPrint = new ArrayList<>();
        logToSave = new ArrayList<>();
        commandBuffer = new ArrayList<>();
    }
    
    public static void println(String s){
        logToPrint.add(s);
        logToSave.add(s);
    }
    
    public static void println(Object o){
        println(o.toString());
    }
    
    public static void submitCommand(){
        logToPrint.add(String.format("Executed \"%s\"", inputLine));
        logToSave.add(String.format("Executed \"%s\"", inputLine));
        commandBuffer.add(0, inputLine);
        resetCommandBufferCounter();
        inputLine = "";
    }
    
    public static void clearCommand(){
        commandBuffer.add(0, inputLine);
        resetCommandBufferCounter();
        inputLine = "";
    }
    
    public static ArrayList<String> getLogToSave(){
        return logToSave;
    }
    
    public static ArrayList<String> getLog(){
        return logToPrint;
    }
    
    public static void cls(){
        logToPrint.clear();
    }
    
    public static void addToInputLine(char c){
        inputLine += c;
    }
    
    public static void backspace(){
        if(inputLine.length() > 0){
        inputLine = inputLine.substring(0, inputLine.length() - 1);
        }
    }
    
    public static void setInputLine(String s){
        inputLine = s;
    }
    
    public static String getInputLine(){
        return inputLine;
    }
    
    public static void previousCommand(boolean up){
        if(up){
            try{
            commandBufferCounter++;
            if(commandBufferCounter > commandBuffer.size() -1){
            commandBufferCounter = commandBuffer.size() -1;
            }
            inputLine = commandBuffer.get(commandBufferCounter);
            }catch(IndexOutOfBoundsException e){

            }
        }
        else{
            try{
            if(commandBufferCounter > -1){
                if(commandBufferCounter > 0){
                    commandBufferCounter--;
                    if(commandBufferCounter < 0){
                    commandBufferCounter = 0;
                    }
                }
                inputLine = commandBuffer.get(commandBufferCounter);
            }
            }catch(IndexOutOfBoundsException e){

            }
        }
    }
    
    public static void resetCommandBufferCounter(){
        commandBufferCounter = -1;
    }
    /*
     private void formKeyPressed(java.awt.event.KeyEvent evt) {                                
        // TODO add your handling code here:
        if(!consoleFocus){
        if(gameScreen == SCREEN_GAME){
            
            if((evt.getKeyCode() == KeyEvent.VK_LEFT) || (evt.getKeyCode() == KeyEvent.VK_A)){
                if(movingDirection != D_RIGHT){
                    movingDirection = D_LEFT;
                }
            }

            if(evt.getKeyCode() == KeyEvent.VK_RIGHT || evt.getKeyCode() == KeyEvent.VK_D){
               if(movingDirection != D_LEFT){
                    movingDirection = D_RIGHT;
                }
            }

            if(evt.getKeyCode() == KeyEvent.VK_UP || evt.getKeyCode() == KeyEvent.VK_W){
                if(movingDirection != D_DOWN){
                    movingDirection = D_UP;
                }
            }

            if(evt.getKeyCode() == KeyEvent.VK_DOWN || evt.getKeyCode() == KeyEvent.VK_S){
                if(movingDirection != D_UP){
                    movingDirection = D_DOWN;
                }
            }
            
            
        }
        else if(gameScreen == SCREEN_RETRY){
            if(evt.getKeyCode() == KeyEvent.VK_DOWN || evt.getKeyCode() == KeyEvent.VK_S){
                retryMenu++;
            }
            else if(evt.getKeyCode() == KeyEvent.VK_UP || evt.getKeyCode() == KeyEvent.VK_W){
                retryMenu--;   
            }
                if(retryMenu > GAMEOVER_EXIT){
                    retryMenu = GAMEOVER_RETRY;
                }
                else if(retryMenu < GAMEOVER_RETRY){
                    retryMenu = GAMEOVER_EXIT;
                }
            
            if(evt.getKeyCode() == KeyEvent.VK_ENTER && retryMenu == GAMEOVER_RETRY){
               reset();
            }
            else if(evt.getKeyCode() == KeyEvent.VK_ENTER && retryMenu == GAMEOVER_EXIT){
                NYI();
            }
            drawFrame();
        }
        }
        else{
            t.stop();
            switch (evt.getKeyCode()) {
                case KeyEvent.VK_ENTER:
                    if(consoleCommand.endsWith("_")){
                        consoleCommand = consoleCommand.substring(0, consoleCommand.length() - 1);
                        printlnConsole(consoleCommand, true);
                        }
                    execCommand(consoleCommand);
                    break;
                case KeyEvent.VK_BACK_SPACE:
                    if(consoleCommand.length() > 1){
                        consoleCommand = consoleCommand.substring(0, consoleCommand.length() - 1);
                        printlnConsole(consoleCommand, true);
                    }   
                    break;
                default:
                    if(!evt.isShiftDown() 
                            && !evt.isControlDown() 
                            && !evt.isAltDown() 
                            && !(evt.getKeyCode() == KeyEvent.VK_LEFT)
                            && !(evt.getKeyCode() == KeyEvent.VK_RIGHT)){
                        if(consoleCommand.endsWith("_")){
                            consoleCommand = consoleCommand.substring(0, consoleCommand.length() - 1);
                        }
                        if(consoleCommand.length() < 66){
                            consoleCommand += evt.getKeyChar();
                            printlnConsole(consoleCommand, true);
                        }
                    }
                    break;
            }
             t.start();
        }
       
        
        if(evt.getKeyCode() == KeyEvent.VK_BACK_QUOTE){
            showHideConsole();
        }
        
        if(evt.getKeyCode() == KeyEvent.VK_SPACE && consoleMode && !consoleFocus){
            debugSnake();
        }
        
        if(evt.getKeyCode() == KeyEvent.VK_P && debugSnake){
            if(t.isRunning()){
                t.stop();
            }
            else{
                t.start();
            }
        }
        
    }                               

    @Override
    public void actionPerformed(ActionEvent e) {
       if(gameScreen == SCREEN_GAME){ 
           
           advanceSnake();

           if(!isCollision()){
           drawFrame();
           checkIfGotFood();
           }
           else{
           gameScreen = SCREEN_RETRY;
           drawFrame();
           }
           
           if(debugSnake){
               String dir = "";
               consoleCls();
               printlnConsole("Debugging snake", false);
               printlnConsole("(press p to start/stop snake, press space to exit debug mode)", false);
               for(int i = 0; i < segLocation.size(); i++){
                   switch(directionLocation.get(i)){
                        case D_UP:
                           dir = "UP";
                           break;
                        case D_DOWN:
                           dir = "DOWN";
                           break;
                        case D_LEFT:
                           dir = "LEFT";
                           break;
                        case D_RIGHT:
                           dir = "RIGHT";
                           break;
                        case D_UP_LEFT:
                           dir = "UP_LEFT";
                           break;
                        case D_UP_RIGHT:
                           dir = "UP_RIGHT";
                           break;
                        case D_DOWN_LEFT:
                           dir = "DOWN_LEFT";
                           break;
                        case D_DOWN_RIGHT:
                           dir = "DOWN_RIGHT";
                           break;
                        case D_LEFT_UP:
                           dir = "LEFT_UP";
                           break;
                        case D_LEFT_DOWN:
                           dir = "LEFT_DOWN";
                           break;
                        case D_RIGHT_UP:
                           dir = "RIGHT_UP";
                           break;
                        case D_RIGHT_DOWN:
                           dir = "RIGHT_DOWN";
                           break;
                   }
                   printlnConsole(String.format("Segment %d | %s | %s | %s",
                           i, dir, segLocation.get(i), screen[segLocation.get(i).y][segLocation.get(i).x]), false);
               }   
           }
           else if(!debugSnake && consoleFocus){
           
           }
        }
        else if(gameScreen == SCREEN_RETRY){
            t.stop();
        }
        else if(gameScreen == SCREEN_ANIM_CONSOLE){
            if(consoleMode){
                if(animationHeight < consoleHeight){
                    animationHeight+=10;
                    this.setSize(screenWidth, animationHeight);
                }
                else{
                    consoleFocus = true;
                    t.setDelay(blinkInterval);
                    gameScreen = SCREEN_CONSOLE;
                }
                
            }
            else{
                if(animationHeight > screenHeight){
                    animationHeight-=10;
                    this.setSize(screenWidth, animationHeight);
                }
                else{
                    consoleFocus = false;
                    t.setDelay(timerInterval);
                    gameScreen = prevGameScreen;
                   
                }
            }
        }
        else if(gameScreen == SCREEN_CONSOLE){
            cursorBlink = !cursorBlink;
            if(cursorBlink){
                consoleCommand += "_";
                printlnConsole(consoleCommand, true);
            }
            else{
                if(consoleCommand.endsWith("_")){
                consoleCommand = consoleCommand.substring(0, consoleCommand.length() - 1);
                printlnConsole(consoleCommand, true);
                }
            }
                
        }
    }
    
    public void showHideConsole(){
        if(consoleMode == false){
                consoleMode = true;
                animationHeight = screenHeight;
                prevGameScreen = gameScreen;
                gameScreen = SCREEN_ANIM_CONSOLE;
                consoleCls();
                t.setDelay(animationInterval);
            }
            else{
                consoleMode = false;
                animationHeight = consoleHeight;
                gameScreen = SCREEN_ANIM_CONSOLE;
                debugSnake = false;
                t.setDelay(animationInterval);
                if(!t.isRunning()){
                    t.start();
                }
            }
    }
    
    public void execCommand(String commandToExec){
        command = commandToExec;
        command = command.substring(1);
        command = command.toLowerCase();
        
        if(command.startsWith("debug ")){
            command = command.substring(6);
            
            if(command.equals("snake")){
                debugSnake();
                clearCommand();
            }
            else{
                printlnConsole("Invalid arguments!", false);
                clearCommand();
            }
        }
        else if(command.startsWith("timer ")){
            command = command.substring(6);
            if(command.equals("stop")){
                t.stop();
                printlnConsole("Timer stopped", false);
            }
            else if(command.equals("start")){
                t.start();
                printlnConsole(String.format("Timer started with interval %d", timerInterval), false);
            }
            else if(command.startsWith("set ")){
                timerInterval = Integer.parseInt(command.substring(4));
                printlnConsole(String.format("Timer set with interval %d ms", timerInterval), false);
            }
            else{
                printlnConsole("Invalid arguments!", false);
            }
            clearCommand();
        }
        else if(command.startsWith("edit ")){
            command = command.substring(5);
            if(command.startsWith("score ")){
                score = Integer.parseInt(command.substring(6));
                printlnConsole(String.format("Score changed to %d", score), false);
                gameScreen = SCREEN_GAME;
                drawFrame();
                gameScreen = SCREEN_CONSOLE;
            }
            else{
                printlnConsole("Invalid arguments!", false);
            }
            clearCommand();
        }
        else if(command.startsWith("cls")){
            consoleCls();
        }
        else{
            printlnConsole("Invalid command!", false);
            clearCommand();
        }
       
        
    }
    
    private void debugSnake(){
        debugSnake = !debugSnake;
        if(debugSnake){
            consoleFocus = false;
            gameScreen = SCREEN_GAME;
            t.setDelay(timerInterval);
            t.start();
        }
        else{
            gameScreen = SCREEN_CONSOLE;
            consoleFocus = true;
            consoleCls();
            t.setDelay(blinkInterval);
            t.start();
        }
    }
    
    private void clearCommand(){
        consoleCommand = ":";
        
    }
    
    public void consoleCls(){
        consoleLog.clear();
        printlnConsole(String.format("Snake console. Program version: %s", revisionVer), false);        
    }
    
    public void printlnConsole(String toPrint, boolean typing){
        if(!typing){

            if(toPrint.length() < 70){
                consoleLog.add(toPrint);
            }
            else{
                consoleLog.add(toPrint.substring(0, 70));
                consoleLog.add(toPrint.substring(71, toPrint.length()));
            }

            toPrint = "<html>";

            int screenScroll;
            if(consoleLog.size() < 9){
                screenScroll = 0;
            }
            else{
                screenScroll = consoleLog.size() - 9;
            }
                  
            for(int i = screenScroll; i < consoleLog.size(); i++){
                if(!consoleLog.get(i).equals("")){
                toPrint += consoleLog.get(i);
                toPrint += "<br>";
                }
            }
            
            consoleLog.add("");
            toPrint += consoleLog.get(consoleLog.size() - 1);
            toPrint += "<br>";
            //consoleLabel.setText(toPrint);
            clearCommand();
        }
        else{
            consoleLog.remove(consoleLog.size() - 1);
            consoleLog.add(toPrint);
 
            toPrint = "<html>";
            
            int screenScroll;
            if(consoleLog.size() < 9){
                screenScroll = 0;
            }
            else{
                screenScroll = consoleLog.size() - 9;
            }
                  
            for(int i = screenScroll; i < consoleLog.size(); i++){
                toPrint += consoleLog.get(i);
                toPrint += "<br>";  
            }
            
            //consoleLabel.setText(toPrint);
        }
    }
    */
}
