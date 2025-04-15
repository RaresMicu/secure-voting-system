// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract VotingAudit {
    struct PollingStation {
        string pollingStation; // ex:CT-01-0193 (Judet + ID localitate + ID sectie)
        mapping(string => uint32) votes; // Map dintre partid si numarul de voturi
        uint256 lastUpdateTime; // Timestamp ultima actualizare de pe blockchain
    }

    // Mapare intre ID-ul sectiei de votare si datele acesteia
    mapping(string => PollingStation) private pollingStations;

    // Event pentru log ce va fi folosit la auditare
    // Indexare, Polling station identifier, List of parties, List of votes corresponding to the parties, Timestamp of the update
    event VotesUpdated(
        string indexed pollingStation,
        string pollingStationId,
        string[] parties,
        uint32[] votes,
        uint256 timestamp
    );

    ///////////////
    // Functie pentru initializarea unei sectii de votare - La inceput se initializeaza toate pentru a nu a consuma mai mult gas pe parcurs(426k gas initial si 126k pe parcurs)
    function initializeStation(
        string memory pollingStationId,
        string[] memory parties
    ) public {
        PollingStation storage station = pollingStations[pollingStationId];

        // Daca sectia nu era initializata, o initializez
        if (bytes(station.pollingStation).length == 0) {
            station.pollingStation = pollingStationId;
        }

        // Initializarea numarului de voturi pentru fiecare partid
        for (uint16 i = 0; i < parties.length; i++) {
            station.votes[parties[i]] = 0;
        }
    }

    ///////////////
    // Functie pentru actualizarea numarului de voturi a tuturor partidelor la o sectie de votare
    function updateVotes(
        string memory pollingStationId, // ID unic al sectiei de votare
        string[] memory parties, // Array cu numele partidelor
        uint32[] memory votes // Array cu numarul de voturi pentru fiecare partid
    ) public {
        require(
            parties.length == votes.length,
            "Parties and votes length mismatch"
        );
        // Datele de la sectia de vot dorita
        PollingStation storage station = pollingStations[pollingStationId];

        // Daca sectia nu exista inainte, o adaugam
        if (bytes(station.pollingStation).length == 0) {
            station.pollingStation = pollingStationId;
        }

        // Actualizarea numarului de voturi pentru fiecare partid
        for (uint16 i = 0; i < parties.length; i++) {
            if (station.votes[parties[i]] != votes[i]) {
                station.votes[parties[i]] = votes[i]; // Actualizez numai daca numarul de voturi e diferit fata de cel de inceput
            } //O scriere costa redundanta e mult mai scumpa decat o verificare if
        }

        // Actualizarea timpului ultimei actualizari
        station.lastUpdateTime = block.timestamp;

        // Emiterea unui eveniment pentru auditare(log)
        emit VotesUpdated(
            pollingStationId,
            pollingStationId,
            parties,
            votes,
            block.timestamp
        );
    }

    ///////////////
    // Functie pentru analizarea voturilor primite de partide intr-o sectie de votare
    function getAllVotes(
        string memory pollingStationId,
        string[] memory parties
    ) public view returns (uint32[] memory votes) {
        PollingStation storage station = pollingStations[pollingStationId];
        require(
            bytes(station.pollingStation).length > 0,
            "Polling station does not exist"
        );

        votes = new uint32[](parties.length);

        for (uint16 i = 0; i < parties.length; i++) {
            votes[i] = station.votes[parties[i]];
        }
    }
}
