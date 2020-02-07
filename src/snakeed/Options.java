/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package snakeed;

import java.awt.event.KeyEvent;
import java.io.BufferedWriter;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.charset.Charset;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Scanner;
import java.util.logging.Level;
import java.util.logging.Logger;

/**
 *
 * @author damian
 */
public class Options {
   
    static HashMap<String,String> optionsAudio;
    static HashMap<String,String> optionsGraphics;
    static HashMap<String,String> optionsGeneral;
    static HashMap<String,String> optionsKeybinds1;
    static HashMap<String,String> optionsKeybinds2;
    static HashMap<String,String> optionsKeybinds3;
    static HashMap<String,String> optionsKeybinds4;
    private Scanner input = null;
    private String readOptions = "";
    private BufferedWriter output = null;
    
    static String configPath;
    
    public Options(){
            optionsAudio = new HashMap<>();
            optionsKeybinds1 = new HashMap<>();
            optionsKeybinds2 = new HashMap<>();
            optionsKeybinds3 = new HashMap<>();
            optionsKeybinds4 = new HashMap<>();
            optionsGraphics = new HashMap<>();
            optionsGeneral = new HashMap<>();
            
            configPath = System.getProperty("user.home") + "/SnakeEd/settings.txt";
            
            readOptions();
    }
    
    
    public final void readOptions(){
       
        try {
            input = new Scanner(new FileReader(configPath));
            while(input.hasNext()){
                readOptions += input.nextLine() + '\n';
            }
            input.close();
        } catch (FileNotFoundException ex) {
            generateDefault();
            DebugConsole.println("Could not find settings file! Generating default.");
        }
        
        updateOptions();
    }
    
    public void changeGeneral(String key, String value){
        optionsGeneral.put(key, value);
    }
    
    public void changeGeneral(String key, int value){
        optionsGeneral.put(key, String.valueOf(value));
    }
    
    public void changeGraphics(String key, String value){
        optionsGeneral.put(key, value);
    }
    
    public void changeGraphics(String key, int value){
        optionsGeneral.put(key, String.valueOf(value));
    }
    
    public void changeAudio(String key, String value){
        optionsGeneral.put(key, value);
    }
    
    public void changeAudio(String key, int value){
        optionsGeneral.put(key, String.valueOf(value));
    }
    
    public void changeKeybinds(String key, int player, String value){
        optionsGeneral.put(key, value);
    }
    
    public void changeKeybinds(String key, int player, int value){
        optionsGeneral.put(key, String.valueOf(value));
    }
    
    
    private final void updateOptions() {
        String workingOpt = readOptions;
        String currentLine;
        while(!workingOpt.startsWith("[end]")){
            currentLine = workingOpt.substring(0, workingOpt.indexOf('\n'));
            
            if(currentLine.startsWith("[general]")){
                workingOpt = fillOptionBank(optionsGeneral, workingOpt);
            }
            
            else if(currentLine.startsWith("[graphics]")){
                workingOpt = fillOptionBank(optionsGraphics, workingOpt);
            }
            
            else if(currentLine.startsWith("[audio]")){
                workingOpt = fillOptionBank(optionsAudio, workingOpt);
            }
            
            else if(currentLine.startsWith("[keys-player1]")){
                workingOpt = fillOptionBank(optionsKeybinds1, workingOpt);
            }
            
            else if(currentLine.startsWith("[keys-player2]")){
                workingOpt = fillOptionBank(optionsKeybinds2, workingOpt);
            }
            
            else if(currentLine.startsWith("[keys-player3]")){
                workingOpt = fillOptionBank(optionsKeybinds3, workingOpt);
            }
            
            else if(currentLine.startsWith("[keys-player4]")){
                workingOpt = fillOptionBank(optionsKeybinds4, workingOpt);
            }
            
            else{
            workingOpt = workingOpt.substring(workingOpt.indexOf('\n')+1);
            }
        }
        
    }
    
    private String fillOptionBank(HashMap<String, String> toFill, String workingOpt){
        workingOpt = workingOpt.substring(workingOpt.indexOf('\n')+1);
        while(!workingOpt.startsWith("[")){
            if(isValidLine(workingOpt)){
            String val = workingOpt.substring(workingOpt.indexOf('=')+1, workingOpt.indexOf('\n'));
            toFill.put(workingOpt.substring(0, workingOpt.indexOf('=')), val);
            }
            workingOpt = workingOpt.substring(workingOpt.indexOf('\n')+1);
        }
        return workingOpt;
    }
    
    public final synchronized boolean writeChanges(){
        boolean updateSuccess = false;
        
        try {
            output = new BufferedWriter(new FileWriter(configPath));
            
            String workingOpt = readOptions;
            
            while(!workingOpt.startsWith("[end]")){
                if(isValidLine(workingOpt)){
                    if(workingOpt.startsWith("[general]")){
                        workingOpt = changeLinesInBank(optionsGeneral, workingOpt);
                    }
                    else if(workingOpt.startsWith("[graphics]")){
                        workingOpt = changeLinesInBank(optionsGraphics, workingOpt);
                    }
                    else if(workingOpt.startsWith("[audio]")){
                        workingOpt = changeLinesInBank(optionsAudio, workingOpt);
                    }
                    else if(workingOpt.startsWith("[keys-player1]")){
                        workingOpt = changeLinesInBank(optionsKeybinds1, workingOpt);
                    }
                    else if(workingOpt.startsWith("[keys-player2]")){
                        workingOpt = changeLinesInBank(optionsKeybinds2, workingOpt);
                    }
                    else if(workingOpt.startsWith("[keys-player3]")){
                        workingOpt = changeLinesInBank(optionsKeybinds3, workingOpt);
                    }
                    else if(workingOpt.startsWith("[keys-player4]")){
                        workingOpt = changeLinesInBank(optionsKeybinds4, workingOpt);
                    }
                    else{
                    workingOpt = workingOpt.substring(workingOpt.indexOf('\n')+1);
                    }
                }
                else{
                workingOpt = workingOpt.substring(workingOpt.indexOf('\n')+1);
                }
            }
            
            output.write(readOptions, 0, readOptions.length());
            output.close();
            
            updateSuccess = true;
        } catch (IOException ex) {
            Logger.getLogger(Options.class.getName()).log(Level.SEVERE, null, ex);
        }
                
        return updateSuccess;
    }
    
    private String changeLinesInBank(HashMap<String, String> ref, String workingOpt){
        workingOpt = workingOpt.substring(workingOpt.indexOf('\n')+1);
        String bankLine;
        
        while(!workingOpt.startsWith("[")){
            bankLine = workingOpt.substring(0, workingOpt.indexOf('\n')+1);
            
            if(isValidLine(workingOpt)){
                for(String s: ref.keySet()){
                    if(bankLine.startsWith(s)){
                        String inOptions = s + "=" + ref.get(s);
                        if(!bankLine.matches(inOptions)){
                            readOptions = readOptions.replace(bankLine, inOptions+'\n');
                        }
                    }
                }
            }
            
            workingOpt = workingOpt.substring(workingOpt.indexOf('\n')+1);
        }
        return workingOpt;
    }
    
    public final void generateDefault(){
        input = new Scanner(Options.class.getResourceAsStream("resources/settings_default.txt"));
        
        try {
            String currentLine;
            File f = new File(System.getProperty("user.home")+"/SnakeEd");
            f.mkdir();
            File settings = new File(f, "settings.txt");
            output = new BufferedWriter(new FileWriter(settings));
            while(input.hasNextLine()){
                currentLine = input.nextLine();
                output.write(String.format("%s\n" ,currentLine));
                readOptions += currentLine + '\n';
            }
            output.close();
        } catch (IOException ex) {
            Logger.getLogger(Options.class.getName()).log(Level.SEVERE, null, ex);
        }
    }
    
    private boolean isValidLine(String workingOpt){
        return !(workingOpt.startsWith("//") || workingOpt.startsWith(" ") || workingOpt.startsWith("\n"));
    }
    
     public static String getGeneral(String key){
        return optionsGeneral.get(key);
    }
     
    public static int getGeneralInt(String key){
        return Integer.parseInt(optionsGeneral.get(key));
    }
    
    public static String getGraphic(String key){
        return optionsGraphics.get(key);
    }
    
    public static int getGraphicInt(String key){
        return Integer.parseInt(optionsGraphics.get(key));
    }
    
    public static String getAudio(String key){
        return optionsAudio.get(key);
    }
    
    public static int getAudioInt(String key){
        return Integer.parseInt(optionsAudio.get(key));
    }
    
    public static int getKeybindInt(String key, int player){
        int keyBind = 0;
        player+=1;
        switch(player){
            case 1:
                keyBind = Integer.parseInt(optionsKeybinds1.get(key));
                break;
            case 2:
                keyBind = Integer.parseInt(optionsKeybinds2.get(key));
                break;
            case 3:
                keyBind = Integer.parseInt(optionsKeybinds3.get(key));
                break;
            case 4:
                keyBind = Integer.parseInt(optionsKeybinds4.get(key));
                break;
        }
        return keyBind;
    }
    
    public static int getPlayerByKeyevent(KeyEvent e){
        int keyCode = e.getKeyCode();
        
        for(int i = 1; i <= 4; i++){
            if(keyCode == getKeybindInt("left", i)){
                return i;
            }
            else if(keyCode == getKeybindInt("right", i)){
                return i;
            }
            else if(keyCode == getKeybindInt("up", i)){
                return i;
            }
            else if(keyCode == getKeybindInt("down", i)){
                return i;
            }
        }
        
        return 0;
    }
    
    public static Direction getDirectionByKeyEvent(KeyEvent e){
        int keyCode = e.getKeyCode();
        
        for(int i = 1; i <= 4; i++){
            if(keyCode == getKeybindInt("left", i)){
                return Direction.LEFT;
            }
            else if(keyCode == getKeybindInt("right", i)){
                return Direction.RIGHT;
            }
            else if(keyCode == getKeybindInt("up", i)){
                return Direction.UP;
            }
            else if(keyCode == getKeybindInt("down", i)){
                return Direction.DOWN;
            }
        }
        
        Direction uknwn = null;
        return uknwn;
    }

    
    
}
