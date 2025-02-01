declare module 'play-sound' {
    interface PlayerOptions {
        players?: string[];
        player?: string;
    }
    
    interface Player {
        play(filepath: string, callback?: (err?: Error) => void): void;
    }
    
    function player(opts?: PlayerOptions): Player;
    export default player;
} 