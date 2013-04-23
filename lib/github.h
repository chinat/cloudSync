#ifndef GITHUB_H
#define GITHUB_H

#include <QMap>
#include <QStringList>
#include <QString>
#include <functional>

#include <QNetworkAccessManager>
#include <QNetworkReply>

#include <QJsonDocument>
#include <QJsonObject>
#include <QJsonArray>
#include <QJsonValue>

#include "http.h"

namespace GitHub {

const QString VERSION {"3.0.0"};
const QString prefix {"https://api.github.com"};

class User : public QObject {
    Q_OBJECT
public :
    enum TYPE  {
        BASIC,
        OAUTH
    };
    
    User(QObject * parent = NULL): QObject(parent) {
        http = new Http::Http(this);
    }
    
    int get (Map &param) {
        QString route = "/user/keys/:id";
        
        
        return 0;
    }
    
    int update(Map &param) {
        
        return 0;
    }
    
    int getOrgs (Map &param) {
        
        return 0;
    }
    
    int getEmails (Map &param) {
        
        return 0;
    }
    
    int addEmails (Map &param) {
        
        return 0;
    }
    
    int deleteEmails (Map &param) {
        
        return 0;
    }
    
    int getFollowers (Map &param) {
        
        return 0;
    }
    
    /**
      *  list current use's key 
      *  GET /user/keys
      *  method basic or OAuth with user scope
      *  param 
      *        token 
      *      or
      *        username
      *        passwd
      */
    int getKeys (Map &param) {
        QString route = "/usr/keys";
        
        
        return 0;
    }
    
    int getKey (Map &param) {
        
        return 0;
    }
    
    /**
      *  add ssh public key to github
      *  POST /usr/keys
      *  method basic
      *  param
      *        title
      *        key
      *        username
      *        passwd
      * 
      *  steps:
      *    checkout if this ssh has added to github 
      *        on linux, /home/user/.ssh/id_rsa.pub
      */
    int createKey (Map &param) {
        QString route = "/user/keys";
        //param check
        if(!param.contains("username") || !param.contains("passwd") || !param.contains("key")) {
            param["_state"] = 1;
            param["_message"] = "username or password is needed";
            return 1;
        }
        if(!param.contains("title")) {
            param["title"] = "GitHub lib base on qt";
        }
        
        QJsonValue title(param["title"].toString());
        QJsonValue key(param["key"].toString());
        QJsonObject obj;
        obj.insert("title", title);
        obj.insert("key", key);
        QJsonDocument data(obj);
        
        QNetworkRequest request(QUrl(QString("%1%2").arg(prefix).arg(route)));
        request.setRawHeader("Authorization", "Basic " + QByteArray(QString("%1:%2")
                                                                    .arg(param["username"].toString())
                             .arg(param["passwd"].toString()).toLatin1().toBase64()));  
        QNetworkReply *reply = http->POST(request, data.toJson());
        connect(reply, &QNetworkReply::finished, [&](){
            // string to json
            QJsonDocument doc = QJsonDocument::fromJson(reply->readAll());
            QJsonObject data = doc.object();
            
            for(QByteArray key : param.keys()) {
                if(data.contains(QString(key))) {
                    param[key] = QVariant::fromValue(data[key].toString());
                }
                else if(reply->rawHeaderList().contains(key)) {
                    param[key] = QVariant::fromValue(reply->rawHeader(key));
                }
            }
            if(param.contains("_state")) 
                param["_state_"] = 0;
            else
                param["_state"] = 0;
            
            emit finished();
            reply->deleteLater();
        });
        
        return 0;
    }
    
    
    int updateKey (Map &param) {
        return 0;
    }
    
    int deleteKey (Map &param) {
        
        return 0;
    }
    
    
protected:
    Http::Http *http;
    
Q_SIGNALS:
    void finished();
};


class Authorization : public QObject {
    Q_OBJECT
public:
    Authorization(QObject * parent = NULL):QObject(parent) {
        http = new Http::Http(this);
        
    }
    
    
    /** 
     *  GET /authorizations/:id
     *  scopes: 
     *  method: basic 
     *  param
     *        username
     *        passwd
     *        id
     */
    int get (Map &param) {
        QString route = "/authorizations/:id";
        
        
        return 0;
    }
    
    /**
     *  GET /authorizations
     *  scopes: "user", "public_repo", "repo", "repo:status", "delete_repo", "gist"
     *  method: basic
     *  param
     *        username
     *        passwd
     */
    int getAll (Map &param) {
        QString route = "/authorizations";
        
        return 0;
    }
    
    /**
     *  POST /authorizations
     *  scopes: 
     *  method: basic
     *  param
     *        username
     *        passwd
     *        contentTypeHeader
     */
    int create (Map &param) {
        QString route = "/authorizations";
        //param check
        if(!param.contains("username") || !param.contains("passwd")) {
            param["_state"] = 1;
            param["_message"] = "username or password is need";
            return 1;
        }
        
        QJsonArray scopes = QJsonArray::fromStringList(this->scopes);
        QJsonValue note(QString("From GitHub Qt lib v0.1"));
        QJsonValue note_utl(QString("http://127.0.0.1/"));
        QJsonObject obj;
        obj.insert("scopes", scopes);
        obj.insert("note", note);
        obj.insert("note_url", note_utl);
        QJsonDocument data(obj);
        
        QNetworkRequest request(QUrl(QString("%1%2").arg(prefix).arg(route)));
        
        //set http content type
        if(param.contains("contentTypeHeader")) 
            request.setHeader(QNetworkRequest::ContentTypeHeader, param["contentTypeHeader"]);
        else 
            request.setHeader(QNetworkRequest::ContentTypeHeader, param.contains("application/json"));
        
        request.setRawHeader("Authorization", "Basic " + QByteArray(QString("%1:%2")
                                                                    .arg(param["username"].toString())
                             .arg(param["passwd"].toString()).toLatin1().toBase64()));    
        QNetworkReply *reply = http->POST(request, data.toJson());
        
        connect(reply, &QNetworkReply::finished, [&]() {
            // string to json
            QJsonDocument doc = QJsonDocument::fromJson(reply->readAll());
            QJsonObject data = doc.object(); 
            
            for(QByteArray key : param.keys()) {
                if(data.contains(QString(key))) {
                    param[key] = QVariant::fromValue(data[key].toString());
                }
                else if(reply->rawHeaderList().contains(key)) {
                    param[key] = reply->rawHeader(key);
                }
            }
            if(param.contains("_state")) 
                param["_state_"] = QVariant::fromValue(0);
            else
                param["_state"] = QVariant::fromValue(0);
            
            emit finished();
            reply->deleteLater();
        });
        return 0;
    }
    
    /**
      *  PATCH /authorizations/:id
      *  scopes:
      *  method: basic
      *  param
      *        username
      *        passwd
      *        id
      */
    int update (Map &param) {
        QString route = "/authorizations/:id";
        
        
        return 0;
    }
    
    /**
      *  DELETE /authorizations/:id
      *  scopes:
      *  param
      *        username
      *        passwd
      */
    int del (Map &param) {
        QString route = "/authorizations/:id";
        
        return 0;
    }
    
    /**
      * GET /applications/:client_id/tokens/:access_token
      */
    int check (Map &param) {
        QString route = "/applications/:client_id/tokens/:access_token";
        
        
        return 0;
    }
    
    
protected:
    QStringList scopes{"user", "user:email", "user:follow", "public_repo", "repo", 
                       "repo:status", "delete_repo", "notifications", "gist"};
    
    Http::Http *http;
    
Q_SIGNALS:
    // delete later
    void finished();
    
};

}

#endif // GITHUB_H
